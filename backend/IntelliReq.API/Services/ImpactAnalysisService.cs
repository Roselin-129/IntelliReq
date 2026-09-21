using System.Text.Json;
using IntelliReq.API.Data;
using IntelliReq.API.DTOs;
using IntelliReq.API.Models;
using IntelliReq.API.Models.Analysis;
using IntelliReq.API.Models.Enums;
using IntelliReq.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace IntelliReq.API.Services;

public class ImpactAnalysisService : IImpactAnalysisService
{
    private readonly IRequirementRepository _reqRepository;
    private readonly IDependencyRepository _depRepository;
    private readonly ApplicationDbContext _context;

    public ImpactAnalysisService(
        IRequirementRepository reqRepository,
        IDependencyRepository depRepository,
        ApplicationDbContext context)
    {
        _reqRepository = reqRepository;
        _depRepository = depRepository;
        _context = context;
    }

    public async Task<(ImpactAnalysisResponseDto? result, string? error)> RunImpactAnalysisAsync(
        Guid requirementId,
        ImpactAnalysisRequestDto request)
    {
        // 1. Load the current requirement
        var requirement = await _reqRepository.GetByIdAsync(requirementId);
        if (requirement == null)
            return (null, "Requirement not found.");

        // 2. Load all saved versions
        var allVersions = await _reqRepository.GetVersionsAsync(requirementId);

        // 3. Resolve old/new version numbers
        int oldVersionNum, newVersionNum;

        if (request.OldVersion.HasValue && request.NewVersion.HasValue)
        {
            oldVersionNum = request.OldVersion.Value;
            newVersionNum = request.NewVersion.Value;
        }
        else if (allVersions.Count >= 1)
        {
            // Default: compare the latest saved version (old) with the current requirement state (new)
            oldVersionNum = allVersions[0].VersionNumber; // ordered DESC
            newVersionNum = requirement.Version;
        }
        else
        {
            return (null, "Not enough version history to compare. Provide explicit oldVersion and newVersion.");
        }

        // 4. Validate both versions exist
        // "current" version is represented by the live Requirement record (version = requirement.Version)
        // Historical versions live in RequirementVersions
        RequirementVersionSnapshot oldSnap;
        RequirementVersionSnapshot newSnap;

        if (oldVersionNum == requirement.Version)
        {
            oldSnap = SnapshotFromRequirement(requirement);
        }
        else
        {
            var oldVer = allVersions.FirstOrDefault(v => v.VersionNumber == oldVersionNum);
            if (oldVer == null)
                return (null, $"Version {oldVersionNum} not found for this requirement.");
            oldSnap = SnapshotFromVersion(oldVer);
        }

        if (newVersionNum == requirement.Version)
        {
            newSnap = SnapshotFromRequirement(requirement);
        }
        else
        {
            var newVer = allVersions.FirstOrDefault(v => v.VersionNumber == newVersionNum);
            if (newVer == null)
                return (null, $"Version {newVersionNum} not found for this requirement.");
            newSnap = SnapshotFromVersion(newVer);
        }

        if (oldVersionNum == newVersionNum)
            return (null, "OldVersion and NewVersion must be different.");

        // 5. Compare fields
        var changedFields = DetectChanges(oldSnap, newSnap);

        // 6. Load dependencies (requirements that depend on this one)
        var deps = await _depRepository.GetByRequirementIdAsync(requirementId);

        // 7. Collect affected requirements
        var affectedReqIds = new List<Guid>();
        var affected = new List<AffectedRequirementDto>();

        foreach (var dep in deps)
        {
            Guid otherId = dep.SourceRequirementId == requirementId
                ? dep.TargetRequirementId
                : dep.SourceRequirementId;

            if (affectedReqIds.Contains(otherId)) continue;
            affectedReqIds.Add(otherId);

            var other = dep.SourceRequirementId == requirementId
                ? dep.TargetRequirement
                : dep.SourceRequirement;

            if (other != null)
            {
                affected.Add(new AffectedRequirementDto
                {
                    Id = other.Id,
                    RequirementCode = other.RequirementCode,
                    Title = other.Title,
                    DependencyType = dep.DependencyType.ToString(),
                    DependencyConfidence = dep.Confidence
                });
            }
        }

        // 8. Calculate deterministic impact score (NOT AI-generated)
        double impactScore = CalculateImpactScore(
            changedFields.Count,
            newSnap.Priority,
            affectedReqIds.Count,
            deps);

        string impactLevel = impactScore switch
        {
            < 25 => "Low",
            < 50 => "Medium",
            < 75 => "High",
            _    => "Critical"
        };

        // 9. Build change summary
        string changeSummary = changedFields.Count == 0
            ? "No differences detected between the selected versions."
            : $"Changes detected in: {string.Join(", ", changedFields.Select(f => f.FieldName))}. " +
              $"Affects {affectedReqIds.Count} related requirement(s).";

        // 10. Persist the result
        var record = new ChangeImpactAnalysis
        {
            Id = Guid.NewGuid(),
            RequirementId = requirementId,
            OldVersion = oldVersionNum,
            NewVersion = newVersionNum,
            ChangeSummary = changeSummary,
            ImpactScore = impactScore,
            ImpactLevel = impactLevel,
            AffectedRequirementIds = JsonSerializer.Serialize(affectedReqIds),
            CreatedAt = DateTime.UtcNow
        };
        _context.ChangeImpactAnalyses.Add(record);
        await _context.SaveChangesAsync();

        // 11. Build related dependencies DTO
        var relatedDeps = deps.Select(d => new DependencyResponseDto
        {
            Id = d.Id,
            ProjectId = d.ProjectId,
            SourceRequirementId = d.SourceRequirementId,
            TargetRequirementId = d.TargetRequirementId,
            DependencyType = d.DependencyType.ToString(),
            Confidence = d.Confidence,
            CreatedAt = d.CreatedAt
        }).ToList();

        var response = new ImpactAnalysisResponseDto
        {
            Id = record.Id,
            RequirementId = requirementId,
            OldVersion = oldVersionNum,
            NewVersion = newVersionNum,
            ImpactScore = impactScore,
            ImpactLevel = impactLevel,
            ChangeSummary = changeSummary,
            ChangedFields = changedFields,
            AffectedRequirements = affected,
            RelatedDependencies = relatedDeps,
            CreatedAt = record.CreatedAt
        };

        return (response, null);
    }

    public async Task<List<ChangeImpactAnalysis>> GetImpactAnalysesForRequirementAsync(Guid requirementId)
    {
        return await _context.ChangeImpactAnalyses
            .Where(c => c.RequirementId == requirementId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<ChangeImpactAnalysis>> GetImpactAnalysesForProjectAsync(Guid projectId)
    {
        var reqIds = await _context.Requirements
            .Where(r => r.ProjectId == projectId)
            .Select(r => r.Id)
            .ToListAsync();

        return await _context.ChangeImpactAnalyses
            .Where(c => reqIds.Contains(c.RequirementId))
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private static RequirementVersionSnapshot SnapshotFromRequirement(Requirement r) => new()
    {
        Title = r.Title,
        Description = r.Description,
        Type = r.Type.ToString(),
        Status = r.Status.ToString(),
        Priority = r.Priority
    };

    private static RequirementVersionSnapshot SnapshotFromVersion(RequirementVersion v) => new()
    {
        Title = v.Title,
        Description = v.Description,
        Type = v.Type.ToString(),
        Status = v.Status.ToString(),
        Priority = v.Priority
    };

    private static List<ChangedFieldDto> DetectChanges(
        RequirementVersionSnapshot old,
        RequirementVersionSnapshot @new)
    {
        var changes = new List<ChangedFieldDto>();

        void Check(string field, string? oldVal, string? newVal)
        {
            if (oldVal != newVal)
                changes.Add(new ChangedFieldDto { FieldName = field, OldValue = oldVal, NewValue = newVal });
        }

        Check("Title", old.Title, @new.Title);
        Check("Description", old.Description, @new.Description);
        Check("Type", old.Type, @new.Type);
        Check("Status", old.Status, @new.Status);
        Check("Priority", old.Priority.ToString(), @new.Priority.ToString());

        return changes;
    }

    /// <summary>
    /// Deterministic impact score calculation.
    /// NOT AI-generated — a transparent, rule-based formula for this phase.
    /// </summary>
    private static double CalculateImpactScore(
        int changedFieldCount,
        RequirementPriority priority,
        int affectedCount,
        List<Dependency> deps)
    {
        // Base score from number of changed fields (max 40 pts)
        double score = Math.Min(changedFieldCount * 10.0, 40.0);

        // Priority weight (max 30 pts)
        score += priority switch
        {
            RequirementPriority.Low      => 5,
            RequirementPriority.Medium   => 10,
            RequirementPriority.High     => 20,
            RequirementPriority.Critical => 30,
            _                            => 0
        };

        // Dependency spread (max 20 pts)
        score += Math.Min(affectedCount * 4.0, 20.0);

        // Weighted confidence of all dependencies (max 10 pts)
        if (deps.Count > 0)
        {
            double avgConf = deps.Average(d => d.Confidence);
            score += avgConf * 10.0;
        }

        return Math.Round(Math.Min(score, 100.0), 2);
    }

    private class RequirementVersionSnapshot
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public RequirementPriority Priority { get; set; }
    }
}
