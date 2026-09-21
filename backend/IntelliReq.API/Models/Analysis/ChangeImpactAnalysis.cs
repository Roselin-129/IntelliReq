using System.Text.Json.Serialization;

namespace IntelliReq.API.Models.Analysis;

public class ChangeImpactAnalysis
{
    public Guid Id { get; set; }

    public Guid RequirementId { get; set; }

    /// <summary>Version number of the older snapshot being compared.</summary>
    public int OldVersion { get; set; }

    /// <summary>Version number of the newer snapshot being compared (0 = current requirement state).</summary>
    public int NewVersion { get; set; }

    /// <summary>Human-readable summary of the detected changes.</summary>
    public string ChangeSummary { get; set; } = string.Empty;

    /// <summary>
    /// Deterministic impact score (0–100). 
    /// NOT AI-generated — calculated from change magnitude, priority, and dependency count.
    /// </summary>
    public double ImpactScore { get; set; }

    /// <summary>Low / Medium / High / Critical</summary>
    public string ImpactLevel { get; set; } = string.Empty;

    /// <summary>
    /// JSON-serialised list of Requirement IDs directly affected via dependencies.
    /// Stored as JSON for this phase; extensible to a relational mapping later.
    /// </summary>
    public string AffectedRequirementIds { get; set; } = "[]";

    public DateTime CreatedAt { get; set; }

    [JsonIgnore]
    public Models.Requirement? Requirement { get; set; }
}
