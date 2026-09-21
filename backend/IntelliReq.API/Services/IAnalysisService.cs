using IntelliReq.API.DTOs;
using IntelliReq.API.Models;

namespace IntelliReq.API.Services;

public interface IAnalysisService
{
    Task<RequirementAnalysis> AnalyzeQualityAsync(Guid requirementId);
    Task<RequirementAnalysis> AnalyzeAmbiguityAsync(Guid requirementId);
    Task<RequirementAnalysis> AnalyzeClassificationAsync(Guid requirementId);
    Task<RequirementAnalysis> AnalyzeRiskAsync(Guid requirementId);
    Task<RequirementAnalysis> AnalyzeComplexityAsync(Guid requirementId);

    Task<CombinedRequirementAnalysisDto> AnalyzeAllAsync(Guid requirementId);
    Task<CombinedRequirementAnalysisDto> GetLatestCombinedAnalysisAsync(Guid requirementId);
    Task<AnalysisSummaryDto?> GetProjectAnalysisSummaryAsync(Guid projectId);

    Task<RequirementAnalysis?> GetLatestAnalysisAsync(Guid requirementId, string analysisType);
}
