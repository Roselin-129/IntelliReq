using IntelliReq.API.DTOs;
using IntelliReq.API.Models;
using IntelliReq.API.Repositories;

namespace IntelliReq.API.Services;

public class ProjectService
{
    private readonly IProjectRepository _repository;

    public ProjectService(IProjectRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Project>> GetAllProjectsAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Project?> GetProjectByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Project> CreateProjectAsync(CreateProjectDto dto)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            Domain = dto.Domain,
            Methodology = dto.Methodology,
            CreatedAt = DateTime.UtcNow
        };

        return await _repository.CreateAsync(project);
    }

    public async Task<bool> UpdateProjectAsync(
        Guid id,
        UpdateProjectDto dto)
    {
        var project = await _repository.GetByIdAsync(id);

        if (project == null)
        {
            return false;
        }

        project.Name = dto.Name;
        project.Description = dto.Description;
        project.Domain = dto.Domain;
        project.Methodology = dto.Methodology;

        return await _repository.UpdateAsync(project);
    }

    public async Task<bool> DeleteProjectAsync(Guid id)
    {
        return await _repository.DeleteAsync(id);
    }
}