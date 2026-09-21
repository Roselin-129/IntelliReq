using IntelliReq.API.Models;

namespace IntelliReq.API.Repositories;

public interface IProjectRepository
{
    Task<List<Project>> GetAllAsync();

    Task<Project?> GetByIdAsync(Guid id);

    Task<Project> CreateAsync(Project project);

    Task<bool> UpdateAsync(Project project);

    Task<bool> DeleteAsync(Guid id);
}