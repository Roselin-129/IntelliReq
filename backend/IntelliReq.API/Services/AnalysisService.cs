using System.Text;
using System.Text.Json;
using IntelliReq.API.Data;
using IntelliReq.API.DTOs;
using IntelliReq.API.Models;
using IntelliReq.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace IntelliReq.API.Services;

public class AnalysisService : IAnalysisService
{
    private readonly ApplicationDbContext _context;
    private readonly IRequirementRepository _requirementRepository;
    private readonly HttpClient _httpClient;

    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public AnalysisService(
        ApplicationDbContext context,
        IRequirementRepository requirementRepository,
        HttpClient httpClient)
    {
        _context = context;
        _requirementRepository = requirementRepository;
        _httpClient = httpClient;
    }


    // ============================================================
    // QUALITY
    // ============================================================

    public async Task<RequirementAnalysis> AnalyzeQualityAsync(Guid requirementId)
    {
        var req = await GetRequirementAsync(requirementId);

        var result = await CallAiServiceAsync<AiQualityResult>(
            "/api/ai/analyze-quality",
            req
        );

        var analysis = new RequirementAnalysis
        {
            Id = Guid.NewGuid(),
            RequirementId = requirementId,
            AnalysisType = "Quality",

            OverallScore = result.QualityScore,
            CompletenessScore = result.CompletenessScore,
            ClarityScore = result.ClarityScore,
            TestabilityScore = result.TestabilityScore,

            DetectedIssues = JsonSerializer.Serialize(
                result.DetectedIssues,
                _jsonOptions
            ),

            Explanation = result.Recommendations.Count > 0
                ? $"{result.QualityLevel}: {string.Join(" ", result.Recommendations)}"
                : result.QualityLevel,

            CreatedAt = DateTime.UtcNow
        };

        _context.RequirementAnalyses.Add(analysis);
        await _context.SaveChangesAsync();

        return analysis;
    }


    // ============================================================
    // AMBIGUITY
    // ============================================================

    public async Task<RequirementAnalysis> AnalyzeAmbiguityAsync(Guid requirementId)
    {
        var req = await GetRequirementAsync(requirementId);

        var result = await CallAiServiceAsync<AiAmbiguityResult>(
            "/api/ai/analyze-ambiguity",
            req
        );

        var analysis = new RequirementAnalysis
        {
            Id = Guid.NewGuid(),
            RequirementId = requirementId,
            AnalysisType = "Ambiguity",

            OverallScore = result.AmbiguityScore,
            IsAmbiguous = result.IsAmbiguous,

            AmbiguousPhrases = JsonSerializer.Serialize(
                result.AmbiguityIndicators,
                _jsonOptions
            ),

            Severity = result.AmbiguityLevel,
            Explanation = result.SuggestedClarification == null
                ? result.Explanation
                : $"{result.Explanation} {result.SuggestedClarification}",

            CreatedAt = DateTime.UtcNow
        };

        _context.RequirementAnalyses.Add(analysis);
        await _context.SaveChangesAsync();

        return analysis;
    }


    // ============================================================
    // CLASSIFICATION
    // ============================================================

    public async Task<RequirementAnalysis> AnalyzeClassificationAsync(Guid requirementId)
    {
        var req = await GetRequirementAsync(requirementId);

        var result = await CallAiServiceAsync<AiClassificationResult>(
            "/api/ai/classify-requirement",
            req
        );

        var analysis = new RequirementAnalysis
        {
            Id = Guid.NewGuid(),
            RequirementId = requirementId,
            AnalysisType = "Classification",

            PredictedType = result.PredictedType,
            ConfidenceScore = result.Confidence,
            Explanation = result.Explanation,

            CreatedAt = DateTime.UtcNow
        };

        _context.RequirementAnalyses.Add(analysis);
        await _context.SaveChangesAsync();

        return analysis;
    }


    // ============================================================
    // RISK
    // ============================================================

    public async Task<RequirementAnalysis> AnalyzeRiskAsync(Guid requirementId)
    {
        var req = await GetRequirementAsync(requirementId);

        var result = await CallAiServiceAsync<AiRiskResult>(
            "/api/ai/analyze-risk",
            req
        );

        var analysis = new RequirementAnalysis
        {
            Id = Guid.NewGuid(),
            RequirementId = requirementId,
            AnalysisType = "Risk",

            OverallScore = result.RiskScore,
            Level = result.RiskLevel,

            Factors = JsonSerializer.Serialize(
                result.RiskFactors,
                _jsonOptions
            ),

            Explanation = $"{result.Explanation} Recommendation: {result.Recommendation}",

            CreatedAt = DateTime.UtcNow
        };

        _context.RequirementAnalyses.Add(analysis);
        await _context.SaveChangesAsync();

        return analysis;
    }


    // ============================================================
    // COMPLEXITY
    // ============================================================

    public async Task<RequirementAnalysis> AnalyzeComplexityAsync(Guid requirementId)
    {
        var req = await GetRequirementAsync(requirementId);

        var result = await CallAiServiceAsync<AiComplexityResult>(
            "/api/ai/analyze-complexity",
            req
        );

        var analysis = new RequirementAnalysis
        {
            Id = Guid.NewGuid(),
            RequirementId = requirementId,
            AnalysisType = "Complexity",

            OverallScore = result.ComplexityScore,
            Level = result.ComplexityLevel,

            Factors = JsonSerializer.Serialize(
                result.ComplexityFactors,
                _jsonOptions
            ),

            Explanation = result.Explanation,

            CreatedAt = DateTime.UtcNow
        };

        _context.RequirementAnalyses.Add(analysis);
        await _context.SaveChangesAsync();

        return analysis;
    }


    // ============================================================
    // GET LATEST ANALYSIS
    // ============================================================

    public async Task<RequirementAnalysis?> GetLatestAnalysisAsync(
        Guid requirementId,
        string analysisType)
    {
        return await _context.RequirementAnalyses
            .Where(a =>
                a.RequirementId == requirementId &&
                a.AnalysisType.ToLower() == analysisType.ToLower())
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync();
    }


    // ============================================================
    // COMBINED ANALYSIS (Phase 3.11)
    // ============================================================

    public async Task<CombinedRequirementAnalysisDto> AnalyzeAllAsync(Guid requirementId)
    {
        var classification = await AnalyzeClassificationAsync(requirementId);
        var quality = await AnalyzeQualityAsync(requirementId);
        var ambiguity = await AnalyzeAmbiguityAsync(requirementId);
        var risk = await AnalyzeRiskAsync(requirementId);
        var complexity = await AnalyzeComplexityAsync(requirementId);

        var req = await GetRequirementAsync(requirementId);

        return BuildCombinedDto(
            req,
            classification,
            quality,
            ambiguity,
            risk,
            complexity
        );
    }

    public async Task<CombinedRequirementAnalysisDto> GetLatestCombinedAnalysisAsync(
        Guid requirementId)
    {
        var req = await GetRequirementAsync(requirementId);

        var classification = await GetLatestAnalysisAsync(requirementId, "Classification");
        var quality = await GetLatestAnalysisAsync(requirementId, "Quality");
        var ambiguity = await GetLatestAnalysisAsync(requirementId, "Ambiguity");
        var risk = await GetLatestAnalysisAsync(requirementId, "Risk");
        var complexity = await GetLatestAnalysisAsync(requirementId, "Complexity");

        return BuildCombinedDto(
            req,
            classification,
            quality,
            ambiguity,
            risk,
            complexity
        );
    }


    // ============================================================
    // PROJECT ANALYSIS SUMMARY (Phase 3.12)
    // ============================================================

    public async Task<AnalysisSummaryDto?> GetProjectAnalysisSummaryAsync(Guid projectId)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
        {
            return null;
        }

        var requirementIds = await _context.Requirements
            .AsNoTracking()
            .Where(r => r.ProjectId == projectId)
            .Select(r => r.Id)
            .ToListAsync();

        var summary = new AnalysisSummaryDto
        {
            ProjectId = projectId,
            TotalRequirements = requirementIds.Count
        };

        if (requirementIds.Count == 0)
        {
            return summary;
        }

        var allAnalyses = await _context.RequirementAnalyses
            .AsNoTracking()
            .Where(a => requirementIds.Contains(a.RequirementId))
            .ToListAsync();

        var latestAnalyses = allAnalyses
            .GroupBy(a => new { a.RequirementId, Type = a.AnalysisType.ToLower() })
            .Select(g => g.OrderByDescending(a => a.CreatedAt).First())
            .ToList();

        var latestByRequirement = latestAnalyses
            .GroupBy(a => a.RequirementId)
            .ToDictionary(
                g => g.Key,
                g => g.ToDictionary(a => a.AnalysisType, StringComparer.OrdinalIgnoreCase)
            );

        string[] requiredTypes =
        [
            "Classification",
            "Quality",
            "Ambiguity",
            "Risk",
            "Complexity"
        ];

        summary.AnalyzedRequirements = latestByRequirement.Count(kvp =>
            requiredTypes.All(t => kvp.Value.ContainsKey(t)));
        summary.UnanalyzedRequirements =
            summary.TotalRequirements - summary.AnalyzedRequirements;

        foreach (var analyses in latestByRequirement.Values)
        {
            if (!analyses.TryGetValue("Classification", out var classification))
            {
                continue;
            }

            switch (classification.PredictedType)
            {
                case "Functional":
                    summary.FunctionalRequirements++;
                    break;
                case "NonFunctional":
                    summary.NonFunctionalRequirements++;
                    break;
                case "Business":
                    summary.BusinessRequirements++;
                    break;
                case "Technical":
                    summary.TechnicalRequirements++;
                    break;
                case "Security":
                    summary.SecurityRequirements++;
                    break;
                case "Performance":
                    summary.PerformanceRequirements++;
                    break;
            }
        }

        var qualityScores = latestAnalyses
            .Where(a => a.AnalysisType.Equals("Quality", StringComparison.OrdinalIgnoreCase)
                        && a.OverallScore.HasValue)
            .Select(a => a.OverallScore!.Value)
            .ToList();

        var ambiguityScores = latestAnalyses
            .Where(a => a.AnalysisType.Equals("Ambiguity", StringComparison.OrdinalIgnoreCase)
                        && a.OverallScore.HasValue)
            .Select(a => a.OverallScore!.Value)
            .ToList();

        var riskScores = latestAnalyses
            .Where(a => a.AnalysisType.Equals("Risk", StringComparison.OrdinalIgnoreCase)
                        && a.OverallScore.HasValue)
            .Select(a => a.OverallScore!.Value)
            .ToList();

        var complexityScores = latestAnalyses
            .Where(a => a.AnalysisType.Equals("Complexity", StringComparison.OrdinalIgnoreCase)
                        && a.OverallScore.HasValue)
            .Select(a => a.OverallScore!.Value)
            .ToList();

        summary.AverageQualityScore = qualityScores.Count > 0
            ? Math.Round(qualityScores.Average(), 4)
            : null;

        summary.AverageAmbiguityScore = ambiguityScores.Count > 0
            ? Math.Round(ambiguityScores.Average(), 4)
            : null;

        summary.AverageRiskScore = riskScores.Count > 0
            ? Math.Round(riskScores.Average(), 4)
            : null;

        summary.AverageComplexityScore = complexityScores.Count > 0
            ? Math.Round(complexityScores.Average(), 4)
            : null;

        summary.HighRiskRequirementCount = latestAnalyses.Count(a =>
            a.AnalysisType.Equals("Risk", StringComparison.OrdinalIgnoreCase)
            && (a.Level == "High" || a.Level == "Critical"));

        summary.HighComplexityRequirementCount = latestAnalyses.Count(a =>
            a.AnalysisType.Equals("Complexity", StringComparison.OrdinalIgnoreCase)
            && a.Level == "High");

        summary.AmbiguousRequirementCount = latestAnalyses.Count(a =>
            a.AnalysisType.Equals("Ambiguity", StringComparison.OrdinalIgnoreCase)
            && a.IsAmbiguous == true);

        summary.LowQualityRequirementCount = latestAnalyses.Count(a =>
            a.AnalysisType.Equals("Quality", StringComparison.OrdinalIgnoreCase)
            && (
                (a.OverallScore.HasValue && a.OverallScore.Value < 0.5)
                || (a.Explanation != null && a.Explanation.StartsWith("Poor"))
            ));

        return summary;
    }


    // ============================================================
    // PRIVATE HELPERS
    // ============================================================

    private static CombinedRequirementAnalysisDto BuildCombinedDto(
        Requirement requirement,
        RequirementAnalysis? classification,
        RequirementAnalysis? quality,
        RequirementAnalysis? ambiguity,
        RequirementAnalysis? risk,
        RequirementAnalysis? complexity)
    {
        var analyses = new[] { classification, quality, ambiguity, risk, complexity }
            .Where(a => a != null)
            .Select(a => a!.CreatedAt)
            .ToList();

        return new CombinedRequirementAnalysisDto
        {
            Requirement = MapRequirementInfo(requirement),
            Classification = classification,
            Quality = quality,
            Ambiguity = ambiguity,
            Risk = risk,
            Complexity = complexity,
            AnalyzedAt = analyses.Count > 0 ? analyses.Max() : null
        };
    }

    private static RequirementInfoDto MapRequirementInfo(Requirement requirement)
    {
        return new RequirementInfoDto
        {
            Id = requirement.Id,
            ProjectId = requirement.ProjectId,
            RequirementCode = requirement.RequirementCode,
            Title = requirement.Title,
            Description = requirement.Description,
            SourceText = requirement.SourceText
        };
    }

    private async Task<Requirement> GetRequirementAsync(Guid requirementId)
    {
        var req = await _requirementRepository.GetByIdAsync(requirementId);

        if (req == null)
        {
            throw new ArgumentException("Requirement not found");
        }

        return req;
    }


    private async Task<T> CallAiServiceAsync<T>(
        string endpoint,
        Requirement requirement)
    {
        var request = new AiAnalysisRequest
        {
            Text = requirement.SourceText
                    ?? requirement.Description
                    ?? requirement.Title,

            RequirementCode = requirement.RequirementCode
        };

        var json = JsonSerializer.Serialize(request, _jsonOptions);

        using var content = new StringContent(
            json,
            Encoding.UTF8,
            "application/json"
        );

        HttpResponseMessage response;

        try
        {
            response = await _httpClient.PostAsync(endpoint, content);
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException(
                "Unable to connect to the AI service at http://127.0.0.1:8000. " +
                "Make sure the FastAPI service is running.",
                ex
            );
        }

        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"AI service returned {(int)response.StatusCode}: {responseBody}"
            );
        }

        T? result;

        try
        {
            result = JsonSerializer.Deserialize<T>(
                responseBody,
                _jsonOptions
            );
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException(
                "AI service returned an empty or invalid response.",
                ex
            );
        }

        if (result == null)
        {
            throw new InvalidOperationException(
                "AI service returned an empty or invalid response."
            );
        }

        return result;
    }
}