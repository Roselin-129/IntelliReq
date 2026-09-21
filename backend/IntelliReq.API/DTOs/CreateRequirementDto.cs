using System.ComponentModel.DataAnnotations;
using IntelliReq.API.Models.Enums;

namespace IntelliReq.API.DTOs;

public class CreateRequirementDto
{
    [Required]
    public Guid ProjectId { get; set; }

    public Guid? DocumentId { get; set; }

    [Required]
    public string RequirementCode { get; set; } = string.Empty;

    [Required]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public RequirementType Type { get; set; }

    public RequirementPriority Priority { get; set; }

    public string? SourceText { get; set; }
}
