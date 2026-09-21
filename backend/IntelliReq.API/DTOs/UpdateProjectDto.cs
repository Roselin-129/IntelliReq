using System.ComponentModel.DataAnnotations;

namespace IntelliReq.API.DTOs;

public class UpdateProjectDto
{
    [Required(ErrorMessage = "Project name is required.")]
    [StringLength(
        100,
        MinimumLength = 3,
        ErrorMessage = "Project name must be between 3 and 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [StringLength(
        500,
        ErrorMessage = "Description cannot exceed 500 characters.")]
    public string? Description { get; set; }

    [StringLength(
        100,
        ErrorMessage = "Domain cannot exceed 100 characters.")]
    public string? Domain { get; set; }

    [StringLength(
        50,
        ErrorMessage = "Methodology cannot exceed 50 characters.")]
    public string? Methodology { get; set; }
}