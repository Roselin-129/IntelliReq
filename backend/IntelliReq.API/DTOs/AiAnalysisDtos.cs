using System.Text.Json.Serialization;

namespace IntelliReq.API.DTOs;

/// <summary>
/// Request sent from ASP.NET Core to the FastAPI AI service.
/// </summary>
public class AiAnalysisRequest
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("requirement_code")]
    public string RequirementCode { get; set; } = "REQ-000";
}


// ============================================================
// Classification
// ============================================================

public class AiClassificationResult
{
    [JsonPropertyName("requirement_code")]
    public string RequirementCode { get; set; } = string.Empty;

    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("predicted_type")]
    public string PredictedType { get; set; } = string.Empty;

    [JsonPropertyName("confidence")]
    public double Confidence { get; set; }

    [JsonPropertyName("explanation")]
    public string Explanation { get; set; } = string.Empty;
}


// ============================================================
// Quality
// ============================================================

public class AiQualityIssue
{
    [JsonPropertyName("issue")]
    public string Issue { get; set; } = string.Empty;

    [JsonPropertyName("severity")]
    public string Severity { get; set; } = string.Empty;

    [JsonPropertyName("suggestion")]
    public string Suggestion { get; set; } = string.Empty;
}

public class AiQualityResult
{
    [JsonPropertyName("requirement_code")]
    public string RequirementCode { get; set; } = string.Empty;

    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("quality_score")]
    public double QualityScore { get; set; }

    [JsonPropertyName("quality_level")]
    public string QualityLevel { get; set; } = string.Empty;

    [JsonPropertyName("completeness_score")]
    public double CompletenessScore { get; set; }

    [JsonPropertyName("clarity_score")]
    public double ClarityScore { get; set; }

    [JsonPropertyName("testability_score")]
    public double TestabilityScore { get; set; }

    [JsonPropertyName("specificity_score")]
    public double SpecificityScore { get; set; }

    [JsonPropertyName("detected_issues")]
    public List<AiQualityIssue> DetectedIssues { get; set; } = new();

    [JsonPropertyName("recommendations")]
    public List<string> Recommendations { get; set; } = new();
}


// ============================================================
// Ambiguity
// ============================================================

public class AiAmbiguityIndicator
{
    [JsonPropertyName("term")]
    public string Term { get; set; } = string.Empty;

    [JsonPropertyName("reason")]
    public string Reason { get; set; } = string.Empty;
}

public class AiAmbiguityResult
{
    [JsonPropertyName("requirement_code")]
    public string RequirementCode { get; set; } = string.Empty;

    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("ambiguity_score")]
    public double AmbiguityScore { get; set; }

    [JsonPropertyName("ambiguity_level")]
    public string AmbiguityLevel { get; set; } = string.Empty;

    [JsonPropertyName("is_ambiguous")]
    public bool IsAmbiguous { get; set; }

    [JsonPropertyName("ambiguity_indicators")]
    public List<AiAmbiguityIndicator> AmbiguityIndicators { get; set; } = new();

    [JsonPropertyName("explanation")]
    public string Explanation { get; set; } = string.Empty;

    [JsonPropertyName("suggested_clarification")]
    public string? SuggestedClarification { get; set; }
}


// ============================================================
// Risk
// ============================================================

public class AiRiskFactor
{
    [JsonPropertyName("factor")]
    public string Factor { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("weight")]
    public double Weight { get; set; }
}

public class AiRiskResult
{
    [JsonPropertyName("requirement_code")]
    public string RequirementCode { get; set; } = string.Empty;

    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("risk_score")]
    public double RiskScore { get; set; }

    [JsonPropertyName("risk_level")]
    public string RiskLevel { get; set; } = string.Empty;

    [JsonPropertyName("risk_factors")]
    public List<AiRiskFactor> RiskFactors { get; set; } = new();

    [JsonPropertyName("explanation")]
    public string Explanation { get; set; } = string.Empty;

    [JsonPropertyName("recommendation")]
    public string Recommendation { get; set; } = string.Empty;
}


// ============================================================
// Complexity
// ============================================================

public class AiComplexityFactor
{
    [JsonPropertyName("factor")]
    public string Factor { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;
}

public class AiComplexityResult
{
    [JsonPropertyName("requirement_code")]
    public string RequirementCode { get; set; } = string.Empty;

    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("complexity_score")]
    public double ComplexityScore { get; set; }

    [JsonPropertyName("complexity_level")]
    public string ComplexityLevel { get; set; } = string.Empty;

    [JsonPropertyName("complexity_factors")]
    public List<AiComplexityFactor> ComplexityFactors { get; set; } = new();

    [JsonPropertyName("explanation")]
    public string Explanation { get; set; } = string.Empty;
}