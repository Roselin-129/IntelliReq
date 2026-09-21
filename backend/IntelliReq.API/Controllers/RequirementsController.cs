using System.Text.Json;
using IntelliReq.API.DTOs;
using IntelliReq.API.Models;
using IntelliReq.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliReq.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RequirementsController : ControllerBase
{
    private readonly RequirementService _requirementService;
    private readonly IAnalysisService _analysisService;

    public RequirementsController(RequirementService requirementService, IAnalysisService analysisService)
    {
        _requirementService = requirementService;
        _analysisService = analysisService;
    }

    // GET: api/Requirements/5
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Requirement>> GetRequirement(Guid id)
    {
        var requirement = await _requirementService.GetRequirementByIdAsync(id);

        if (requirement == null)
        {
            return NotFound();
        }

        return Ok(requirement);
    }

    // POST: api/Requirements
    [HttpPost]
    public async Task<ActionResult<Requirement>> CreateRequirement(CreateRequirementDto dto)
    {
        var created = await _requirementService.CreateRequirementAsync(dto);
        if (created == null)
        {
            return BadRequest("Invalid Project or Document reference.");
        }

        return CreatedAtAction(nameof(GetRequirement), new { id = created.Id }, created);
    }

    // PUT: api/Requirements/5
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateRequirement(Guid id, UpdateRequirementDto dto)
    {
        var updated = await _requirementService.UpdateRequirementAsync(id, dto);

        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }

    // DELETE: api/Requirements/5
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteRequirement(Guid id)
    {
        var deleted = await _requirementService.DeleteRequirementAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    // GET: api/Requirements/5/versions
    [HttpGet("{id:guid}/versions")]
    public async Task<ActionResult<List<RequirementVersion>>> GetRequirementVersions(Guid id)
    {
        var versions = await _requirementService.GetRequirementVersionsAsync(id);
        return Ok(versions);
    }

    // GET: api/Requirements/5/versions/2
    [HttpGet("{id:guid}/versions/{versionNumber:int}")]
    public async Task<ActionResult<RequirementVersion>> GetRequirementVersion(Guid id, int versionNumber)
    {
        var version = await _requirementService.GetRequirementVersionAsync(id, versionNumber);
        if (version == null)
        {
            return NotFound();
        }
        return Ok(version);
    }

    // POST: api/requirements/{id}/analysis
    [HttpPost("{id:guid}/analysis")]
    public async Task<ActionResult<CombinedRequirementAnalysisDto>> AnalyzeAll(Guid id)
    {
        try
        {
            return Ok(await _analysisService.AnalyzeAllAsync(id));
        }
        catch (Exception ex)
        {
            return HandleAnalysisException(ex);
        }
    }

    // GET: api/requirements/{id}/analysis
    [HttpGet("{id:guid}/analysis")]
    public async Task<ActionResult<CombinedRequirementAnalysisDto>> GetCombinedAnalysis(Guid id)
    {
        try
        {
            return Ok(await _analysisService.GetLatestCombinedAnalysisAsync(id));
        }
        catch (Exception ex)
        {
            return HandleAnalysisException(ex);
        }
    }

    // POST: api/requirements/{id}/analysis/quality
    [HttpPost("{id:guid}/analysis/quality")]
    public async Task<ActionResult<RequirementAnalysis>> AnalyzeQuality(Guid id)
    {
        try
        {
            return Ok(await _analysisService.AnalyzeQualityAsync(id));
        }
        catch (Exception ex)
        {
            return HandleAnalysisException(ex);
        }
    }

    // POST: api/requirements/{id}/analysis/ambiguity
    [HttpPost("{id:guid}/analysis/ambiguity")]
    public async Task<ActionResult<RequirementAnalysis>> AnalyzeAmbiguity(Guid id)
    {
        try
        {
            return Ok(await _analysisService.AnalyzeAmbiguityAsync(id));
        }
        catch (Exception ex)
        {
            return HandleAnalysisException(ex);
        }
    }

    // POST: api/requirements/{id}/analysis/classification
    [HttpPost("{id:guid}/analysis/classification")]
    public async Task<ActionResult<RequirementAnalysis>> AnalyzeClassification(Guid id)
    {
        try
        {
            return Ok(await _analysisService.AnalyzeClassificationAsync(id));
        }
        catch (Exception ex)
        {
            return HandleAnalysisException(ex);
        }
    }

    // POST: api/requirements/{id}/analysis/risk
    [HttpPost("{id:guid}/analysis/risk")]
    public async Task<ActionResult<RequirementAnalysis>> AnalyzeRisk(Guid id)
    {
        try
        {
            return Ok(await _analysisService.AnalyzeRiskAsync(id));
        }
        catch (Exception ex)
        {
            return HandleAnalysisException(ex);
        }
    }

    // POST: api/requirements/{id}/analysis/complexity
    [HttpPost("{id:guid}/analysis/complexity")]
    public async Task<ActionResult<RequirementAnalysis>> AnalyzeComplexity(Guid id)
    {
        try
        {
            return Ok(await _analysisService.AnalyzeComplexityAsync(id));
        }
        catch (Exception ex)
        {
            return HandleAnalysisException(ex);
        }
    }

    // GET: api/requirements/{id}/analysis/{type}
    [HttpGet("{id:guid}/analysis/{type}")]
    public async Task<ActionResult<RequirementAnalysis>> GetAnalysis(Guid id, string type)
    {
        var requirement = await _requirementService.GetRequirementByIdAsync(id);
        if (requirement == null)
        {
            return NotFound();
        }

        var analysis = await _analysisService.GetLatestAnalysisAsync(id, type);
        if (analysis == null)
        {
            return NotFound();
        }

        return Ok(analysis);
    }

    // GET: api/requirements/{id}/dependencies
    [HttpGet("{id:guid}/dependencies")]
    public async Task<IActionResult> GetRequirementDependencies(
        Guid id,
        [FromServices] IDependencyService dependencyService)
    {
        var deps = await dependencyService.GetDependenciesByRequirementAsync(id);
        return Ok(deps);
    }

    // POST: api/requirements/{id}/impact-analysis
    [HttpPost("{id:guid}/impact-analysis")]
    public async Task<ActionResult<ImpactAnalysisResponseDto>> RunImpactAnalysis(
        Guid id,
        ImpactAnalysisRequestDto request,
        [FromServices] IImpactAnalysisService impactService)
    {
        var (result, error) = await impactService.RunImpactAnalysisAsync(id, request);
        if (result == null) return BadRequest(error);
        return Ok(result);
    }

    // GET: api/requirements/{id}/impact-analysis
    [HttpGet("{id:guid}/impact-analysis")]
    public async Task<IActionResult> GetImpactAnalyses(
        Guid id,
        [FromServices] IImpactAnalysisService impactService)
    {
        var results = await impactService.GetImpactAnalysesForRequirementAsync(id);
        return Ok(results);
    }

    private ActionResult HandleAnalysisException(Exception ex)
    {
        return ex switch
        {
            ArgumentException => NotFound(),
            InvalidOperationException => StatusCode(
                StatusCodes.Status502BadGateway,
                new { error = ex.Message }),
            JsonException => StatusCode(
                StatusCodes.Status502BadGateway,
                new { error = "AI service returned an invalid response." }),
            _ => StatusCode(
                StatusCodes.Status500InternalServerError,
                new { error = "An unexpected error occurred while processing the analysis request." })
        };
    }
}
