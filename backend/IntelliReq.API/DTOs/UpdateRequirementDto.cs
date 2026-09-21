using System.ComponentModel.DataAnnotations;
using IntelliReq.API.Models.Enums;

namespace IntelliReq.API.DTOs;

public class UpdateRequirementDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public RequirementType Type { get; set; }

    public RequirementStatus Status { get; set; }

    public RequirementPriority Priority { get; set; }

    public string? ChangeDescription { get; set; }
}
