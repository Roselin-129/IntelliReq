using IntelliReq.API.DTOs;
using IntelliReq.API.Models.Analysis;

namespace IntelliReq.API.Services;

public interface IImpactAnalysisService
{
    Task<(ImpactAnalysisResponseDto? result, string? error)> RunImpactAnalysisAsync(
        Guid requirementId,
        ImpactAnalysisRequestDto request);

    Task<List<ChangeImpactAnalysis>> GetImpactAnalysesForRequirementAsync(Guid requirementId);
    Task<List<ChangeImpactAnalysis>> GetImpactAnalysesForProjectAsync(Guid projectId);
}
