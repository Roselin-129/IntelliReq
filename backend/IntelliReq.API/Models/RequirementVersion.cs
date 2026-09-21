using System.Text.Json.Serialization;
using IntelliReq.API.Models.Enums;

namespace IntelliReq.API.Models;

public class RequirementVersion
{
    public Guid Id { get; set; }

    public Guid RequirementId { get; set; }

    public int VersionNumber { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public RequirementType Type { get; set; }

    public RequirementStatus Status { get; set; }

    public RequirementPriority Priority { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? ChangeDescription { get; set; }

    [JsonIgnore]
    public Requirement? Requirement { get; set; }
}
