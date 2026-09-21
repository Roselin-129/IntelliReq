using System.Text.Json.Serialization;
using IntelliReq.API.Models.Enums;

namespace IntelliReq.API.Models;

public class Requirement
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }
    
    public Guid? DocumentId { get; set; }

    public string RequirementCode { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public RequirementType Type { get; set; }

    public RequirementStatus Status { get; set; }

    public RequirementPriority Priority { get; set; }

    public int Version { get; set; }

    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }

    public string? SourceText { get; set; }

    [JsonIgnore]
    public Project? Project { get; set; }
    
    [JsonIgnore]
    public Document? Document { get; set; }
    
    [JsonIgnore]
    public List<RequirementVersion> Versions { get; set; } = new();

    [JsonIgnore]
    public List<Dependency> SourceDependencies { get; set; } = new();

    [JsonIgnore]
    public List<Dependency> TargetDependencies { get; set; } = new();
}
