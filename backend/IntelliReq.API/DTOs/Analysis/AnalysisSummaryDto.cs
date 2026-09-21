namespace IntelliReq.API.DTOs;

public class AnalysisSummaryDto
{
    public Guid ProjectId { get; set; }
    public int TotalRequirements { get; set; }
    public int AnalyzedRequirements { get; set; }
    public int UnanalyzedRequirements { get; set; }

    public int FunctionalRequirements { get; set; }
    public int NonFunctionalRequirements { get; set; }
    public int BusinessRequirements { get; set; }
    public int TechnicalRequirements { get; set; }
    public int SecurityRequirements { get; set; }
    public int PerformanceRequirements { get; set; }

    public double? AverageQualityScore { get; set; }
    public double? AverageAmbiguityScore { get; set; }
    public double? AverageRiskScore { get; set; }
    public double? AverageComplexityScore { get; set; }

    public int HighRiskRequirementCount { get; set; }
    public int HighComplexityRequirementCount { get; set; }
    public int AmbiguousRequirementCount { get; set; }
    public int LowQualityRequirementCount { get; set; }
}
