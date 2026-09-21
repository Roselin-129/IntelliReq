using IntelliReq.API.DTOs;
using IntelliReq.API.Models;
using IntelliReq.API.Models.Enums;
using IntelliReq.API.Repositories;

namespace IntelliReq.API.Services;

public class RequirementService
{
    private readonly IRequirementRepository _repository;
    private readonly IProjectRepository _projectRepository;
    private readonly IDocumentRepository _documentRepository;

    public RequirementService(
        IRequirementRepository repository,
        IProjectRepository projectRepository,
        IDocumentRepository documentRepository)
    {
        _repository = repository;
        _projectRepository = projectRepository;
        _documentRepository = documentRepository;
    }

    public async Task<List<Requirement>> GetRequirementsByProjectAsync(Guid projectId)
    {
        return await _repository.GetByProjectIdAsync(projectId);
    }

    public async Task<Requirement?> GetRequirementByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Requirement?> CreateRequirementAsync(CreateRequirementDto dto)
    {
        // Validate Project
        var project = await _projectRepository.GetByIdAsync(dto.ProjectId);
        if (project == null) return null;

        // Validate Document if provided
        if (dto.DocumentId.HasValue)
        {
            var document = await _documentRepository.GetByIdAsync(dto.DocumentId.Value);
            if (document == null || document.ProjectId != dto.ProjectId) return null;
        }

        var requirement = new Requirement
        {
            Id = Guid.NewGuid(),
            ProjectId = dto.ProjectId,
            DocumentId = dto.DocumentId,
            RequirementCode = dto.RequirementCode,
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            Priority = dto.Priority,
            Status = RequirementStatus.Draft,
            Version = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            SourceText = dto.SourceText
        };

        return await _repository.CreateAsync(requirement);
    }

    public async Task<bool> UpdateRequirementAsync(Guid id, UpdateRequirementDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return false;

        // Create version history
        var previousVersion = new RequirementVersion
        {
            Id = Guid.NewGuid(),
            RequirementId = existing.Id,
            VersionNumber = existing.Version,
            Title = existing.Title,
            Description = existing.Description,
            Type = existing.Type,
            Status = existing.Status,
            Priority = existing.Priority,
            CreatedAt = DateTime.UtcNow,
            ChangeDescription = dto.ChangeDescription ?? "Requirement updated"
        };

        // Apply updates
        existing.Title = dto.Title;
        existing.Description = dto.Description;
        existing.Type = dto.Type;
        existing.Status = dto.Status;
        existing.Priority = dto.Priority;
        existing.Version += 1;
        existing.UpdatedAt = DateTime.UtcNow;

        return await _repository.UpdateAsync(existing, previousVersion);
    }

    public async Task<bool> DeleteRequirementAsync(Guid id)
    {
        return await _repository.DeleteAsync(id);
    }

    public async Task<List<RequirementVersion>> GetRequirementVersionsAsync(Guid id)
    {
        return await _repository.GetVersionsAsync(id);
    }

    public async Task<RequirementVersion?> GetRequirementVersionAsync(Guid id, int versionNumber)
    {
        return await _repository.GetVersionAsync(id, versionNumber);
    }
}
