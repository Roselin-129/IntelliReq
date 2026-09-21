using System.ComponentModel.DataAnnotations;
using IntelliReq.API.Models.Enums;

namespace IntelliReq.API.DTOs;

public class CreateDependencyDto
{
    [Required]
    public Guid ProjectId { get; set; }

    [Required]
    public Guid SourceRequirementId { get; set; }

    [Required]
    public Guid TargetRequirementId { get; set; }

    [Required]
    public DependencyType DependencyType { get; set; }

    /// <summary>0.0 to 1.0. Defaults to 1.0 (manually asserted).</summary>
    [Range(0.0, 1.0)]
    public double Confidence { get; set; } = 1.0;
}
