using System.Text.Json.Serialization;

namespace IntelliReq.API.Models;

public class Project
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Domain { get; set; }

    public string? Methodology { get; set; }

    public DateTime CreatedAt { get; set; }

    [JsonIgnore]
    public List<Requirement> Requirements { get; set; } = new();

    [JsonIgnore]
    public List<Dependency> Dependencies { get; set; } = new();
}