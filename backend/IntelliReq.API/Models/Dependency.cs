using System.Text.Json.Serialization;
using IntelliReq.API.Models.Enums;

namespace IntelliReq.API.Models;

public class Dependency
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }

    public Guid SourceRequirementId { get; set; }

    public Guid TargetRequirementId { get; set; }

    public DependencyType DependencyType { get; set; }

    /// <summary>
    /// Confidence/Strength of this dependency link (0.0 – 1.0).
    /// Placeholder — may be enhanced by the future Python/FastAPI NLP service.
    /// </summary>
    public double Confidence { get; set; } = 1.0;

    public DateTime CreatedAt { get; set; }

    [JsonIgnore]
    public Project? Project { get; set; }

    [JsonIgnore]
    public Requirement? SourceRequirement { get; set; }

    [JsonIgnore]
    public Requirement? TargetRequirement { get; set; }
}
