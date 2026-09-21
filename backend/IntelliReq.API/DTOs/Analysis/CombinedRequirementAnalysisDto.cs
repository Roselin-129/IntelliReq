using IntelliReq.API.Models;

namespace IntelliReq.API.DTOs;

public class RequirementInfoDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string RequirementCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? SourceText { get; set; }
}

public class CombinedRequirementAnalysisDto
{
    public RequirementInfoDto Requirement { get; set; } = new();
    public RequirementAnalysis? Classification { get; set; }
    public RequirementAnalysis? Quality { get; set; }
    public RequirementAnalysis? Ambiguity { get; set; }
    public RequirementAnalysis? Risk { get; set; }
    public RequirementAnalysis? Complexity { get; set; }
    public DateTime? AnalyzedAt { get; set; }
}
