namespace IntelliReq.API.DTOs;

public class ChangedFieldDto
{
    public string FieldName { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
}

public class AffectedRequirementDto
{
    public Guid Id { get; set; }
    public string RequirementCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string DependencyType { get; set; } = string.Empty;
    public double DependencyConfidence { get; set; }
}

public class ImpactAnalysisResponseDto
{
    public Guid Id { get; set; }
    public Guid RequirementId { get; set; }

    public int OldVersion { get; set; }
    public int NewVersion { get; set; }

    /// <summary>
    /// Deterministic impact score (0–100).
    /// NOT AI-generated — calculated from change magnitude, priority, and dependency count.
    /// </summary>
    public double ImpactScore { get; set; }

    /// <summary>Low / Medium / High / Critical</summary>
    public string ImpactLevel { get; set; } = string.Empty;

    public string ChangeSummary { get; set; } = string.Empty;

    public List<ChangedFieldDto> ChangedFields { get; set; } = new();

    public List<AffectedRequirementDto> AffectedRequirements { get; set; } = new();

    public List<DependencyResponseDto> RelatedDependencies { get; set; } = new();

    public DateTime CreatedAt { get; set; }
}
