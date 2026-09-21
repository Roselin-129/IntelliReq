using IntelliReq.API.DTOs;
using IntelliReq.API.Models;
using IntelliReq.API.Repositories;

namespace IntelliReq.API.Services;

public class DependencyService : IDependencyService
{
    private readonly IDependencyRepository _depRepository;
    private readonly IRequirementRepository _reqRepository;
    private readonly IProjectRepository _projectRepository;

    public DependencyService(
        IDependencyRepository depRepository,
        IRequirementRepository reqRepository,
        IProjectRepository projectRepository)
    {
        _depRepository = depRepository;
        _reqRepository = reqRepository;
        _projectRepository = projectRepository;
    }

    public async Task<(Dependency? dependency, string? error)> CreateDependencyAsync(CreateDependencyDto dto)
    {
        // 1. Validate project exists
        var project = await _projectRepository.GetByIdAsync(dto.ProjectId);
        if (project == null)
            return (null, "Project not found.");

        // 2. Validate source requirement exists and belongs to project
        var source = await _reqRepository.GetByIdAsync(dto.SourceRequirementId);
        if (source == null || source.ProjectId != dto.ProjectId)
            return (null, "Source requirement not found or does not belong to the specified project.");

        // 3. Validate target requirement exists and belongs to project
        var target = await _reqRepository.GetByIdAsync(dto.TargetRequirementId);
        if (target == null || target.ProjectId != dto.ProjectId)
            return (null, "Target requirement not found or does not belong to the specified project.");

        // 4. Prevent self-dependency
        if (dto.SourceRequirementId == dto.TargetRequirementId)
            return (null, "A requirement cannot depend on itself.");

        // 5. Prevent duplicate dependency
        if (await _depRepository.ExistsAsync(dto.SourceRequirementId, dto.TargetRequirementId, dto.DependencyType))
            return (null, "A dependency with the same source, target, and type already exists.");

        var dependency = new Dependency
        {
            Id = Guid.NewGuid(),
            ProjectId = dto.ProjectId,
            SourceRequirementId = dto.SourceRequirementId,
            TargetRequirementId = dto.TargetRequirementId,
            DependencyType = dto.DependencyType,
            Confidence = dto.Confidence,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _depRepository.CreateAsync(dependency);
        return (created, null);
    }

    public async Task<Dependency?> GetDependencyByIdAsync(Guid id)
        => await _depRepository.GetByIdAsync(id);

    public async Task<List<Dependency>> GetDependenciesByProjectAsync(Guid projectId)
        => await _depRepository.GetByProjectIdAsync(projectId);

    public async Task<List<Dependency>> GetDependenciesByRequirementAsync(Guid requirementId)
        => await _depRepository.GetByRequirementIdAsync(requirementId);

    public async Task<DependencyGraphDto> GetDependencyGraphAsync(Guid projectId)
    {
        var deps = await _depRepository.GetByProjectIdAsync(projectId);

        // Build distinct node set from all source and target requirements
        var reqMap = new Dictionary<Guid, Requirement>();
        foreach (var d in deps)
        {
            if (d.SourceRequirement != null)
                reqMap.TryAdd(d.SourceRequirement.Id, d.SourceRequirement);
            if (d.TargetRequirement != null)
                reqMap.TryAdd(d.TargetRequirement.Id, d.TargetRequirement);
        }

        var nodes = reqMap.Values.Select(r => new DependencyGraphNodeDto
        {
            Id = r.Id.ToString(),
            RequirementId = r.Id,
            RequirementCode = r.RequirementCode,
            Title = r.Title
        }).ToList();

        var edges = deps.Select(d => new DependencyGraphEdgeDto
        {
            Id = d.Id.ToString(),
            Source = d.SourceRequirementId.ToString(),
            Target = d.TargetRequirementId.ToString(),
            SourceRequirementId = d.SourceRequirementId,
            TargetRequirementId = d.TargetRequirementId,
            DependencyType = d.DependencyType.ToString(),
            Confidence = d.Confidence
        }).ToList();

        return new DependencyGraphDto { Nodes = nodes, Edges = edges };
    }

    public async Task<bool> DeleteDependencyAsync(Guid id)
        => await _depRepository.DeleteAsync(id);
}
