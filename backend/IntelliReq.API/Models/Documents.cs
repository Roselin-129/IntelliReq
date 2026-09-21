using System.Text.Json.Serialization;

namespace IntelliReq.API.Models;

public class Document
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string FileType { get; set; } = string.Empty;

    public string FilePath { get; set; } = string.Empty;

    public int Version { get; set; }

    public string Status { get; set; } = "Uploaded";

    public DateTime UploadedAt { get; set; }

    [JsonIgnore]
    public List<Requirement> Requirements { get; set; } = new();
}