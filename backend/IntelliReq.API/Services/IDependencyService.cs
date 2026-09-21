using IntelliReq.API.DTOs;
using IntelliReq.API.Models;

namespace IntelliReq.API.Services;

public interface IDependencyService
{
    Task<(Dependency? dependency, string? error)> CreateDependencyAsync(CreateDependencyDto dto);
    Task<Dependency?> GetDependencyByIdAsync(Guid id);
    Task<List<Dependency>> GetDependenciesByProjectAsync(Guid projectId);
    Task<List<Dependency>> GetDependenciesByRequirementAsync(Guid requirementId);
    Task<DependencyGraphDto> GetDependencyGraphAsync(Guid projectId);
    Task<bool> DeleteDependencyAsync(Guid id);
}
