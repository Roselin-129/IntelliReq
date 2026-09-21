using IntelliReq.API.Models.Enums;

namespace IntelliReq.API.DTOs;

public class DependencyResponseDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid SourceRequirementId { get; set; }
    public Guid TargetRequirementId { get; set; }
    public string DependencyType { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── Graph response ─────────────────────────────────────────────────────────

public class DependencyGraphNodeDto
{
    /// <summary>Unique node ID for React Flow.</summary>
    public string Id { get; set; } = string.Empty;
    public Guid RequirementId { get; set; }
    public string RequirementCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
}

public class DependencyGraphEdgeDto
{
    /// <summary>Unique edge ID for React Flow.</summary>
    public string Id { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;   // RequirementId (string)
    public string Target { get; set; } = string.Empty;   // RequirementId (string)
    public Guid SourceRequirementId { get; set; }
    public Guid TargetRequirementId { get; set; }
    public string DependencyType { get; set; } = string.Empty;
    public double Confidence { get; set; }
}

public class DependencyGraphDto
{
    public List<DependencyGraphNodeDto> Nodes { get; set; } = new();
    public List<DependencyGraphEdgeDto> Edges { get; set; } = new();
}
