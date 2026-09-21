using IntelliReq.API.Models;

namespace IntelliReq.API.Repositories;

public interface IRequirementRepository
{
    Task<List<Requirement>> GetByProjectIdAsync(Guid projectId);
    Task<Requirement?> GetByIdAsync(Guid id);
    Task<Requirement> CreateAsync(Requirement requirement);
    Task<bool> UpdateAsync(Requirement requirement, RequirementVersion previousVersion);
    Task<bool> DeleteAsync(Guid id);
    Task<List<RequirementVersion>> GetVersionsAsync(Guid requirementId);
    Task<RequirementVersion?> GetVersionAsync(Guid requirementId, int versionNumber);
}
