using System.ComponentModel.DataAnnotations;

namespace IntelliReq.API.DTOs;

public class ImpactAnalysisRequestDto
{
    /// <summary>Version number of the older snapshot. Null = compare last two saved versions.</summary>
    public int? OldVersion { get; set; }

    /// <summary>Version number of the newer snapshot. Null = use current requirement state.</summary>
    public int? NewVersion { get; set; }
}
