using IntelliReq.API.Models;

namespace IntelliReq.API.Repositories;

public interface IDependencyRepository
{
    Task<Dependency?> GetByIdAsync(Guid id);
    Task<List<Dependency>> GetByProjectIdAsync(Guid projectId);
    Task<List<Dependency>> GetByRequirementIdAsync(Guid requirementId);
    Task<bool> ExistsAsync(Guid sourceId, Guid targetId, Models.Enums.DependencyType type);
    Task<Dependency> CreateAsync(Dependency dependency);
    Task<bool> DeleteAsync(Guid id);
}
