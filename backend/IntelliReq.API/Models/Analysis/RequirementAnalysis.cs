using System.Text.Json.Serialization;

namespace IntelliReq.API.Models;

public class RequirementAnalysis
{
    public Guid Id { get; set; }

    public Guid RequirementId { get; set; }

    public string AnalysisType { get; set; } = string.Empty; // "Quality", "Ambiguity", "Classification", "Risk", "Complexity"

    // Generic Score/Result fields, usage depends on AnalysisType
    public double? OverallScore { get; set; } // QualityScore, AmbiguityScore, RiskScore, ComplexityScore
    
    // For Quality
    public double? CompletenessScore { get; set; }
    public double? ClarityScore { get; set; }
    public double? TestabilityScore { get; set; }
    public double? ConsistencyScore { get; set; }
    public string? DetectedIssues { get; set; } // Can store JSON or comma-separated
    
    // For Ambiguity
    public bool? IsAmbiguous { get; set; }
    public string? AmbiguousPhrases { get; set; } // JSON or comma-separated
    public string? Severity { get; set; }
    
    // For Classification
    public string? PredictedType { get; set; }
    public double? ConfidenceScore { get; set; }
    
    // For Risk & Complexity
    public string? Level { get; set; } // Low/Medium/High/Critical/VeryHigh
    public string? Factors { get; set; } // RiskFactors or ComplexityFactors (JSON or comma-separated)

    public string? Explanation { get; set; }

    public DateTime CreatedAt { get; set; }

    [JsonIgnore]
    public Requirement? Requirement { get; set; }
}
