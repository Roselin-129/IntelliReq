using System.ComponentModel.DataAnnotations;

namespace IntelliReq.API.DTOs;

public class ProjectAnalysisSummaryDto
{
    public int TotalRequirements { get; set; }
    public double AverageQualityScore { get; set; }
    public int AmbiguousRequirementCount { get; set; }
    public Dictionary<string, int> ClassificationCounts { get; set; } = new();
    public Dictionary<string, int> RiskDistribution { get; set; } = new();
    public Dictionary<string, int> ComplexityDistribution { get; set; } = new();
}
