using IntelliReq.API.DTOs;
using IntelliReq.API.Models;
using IntelliReq.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliReq.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly ProjectService _projectService;

    public ProjectsController(ProjectService projectService)
    {
        _projectService = projectService;
    }

    // GET: api/Projects
    [HttpGet]
    public async Task<ActionResult<List<Project>>> GetProjects()
    {
        var projects = await _projectService.GetAllProjectsAsync();

        return Ok(projects);
    }

    // GET: api/Projects/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Project>> GetProject(Guid id)
    {
        var project = await _projectService.GetProjectByIdAsync(id);

        if (project == null)
        {
            return NotFound();
        }

        return Ok(project);
    }

    // POST: api/Projects
    [HttpPost]
    public async Task<ActionResult<Project>> CreateProject(
        CreateProjectDto dto)
    {
        var createdProject =
            await _projectService.CreateProjectAsync(dto);

        return CreatedAtAction(
            nameof(GetProject),
            new { id = createdProject.Id },
            createdProject);
    }

    // PUT: api/Projects/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProject(
        Guid id,
        UpdateProjectDto dto)
    {
        var updated =
            await _projectService.UpdateProjectAsync(id, dto);

        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }

    // DELETE: api/Projects/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var deleted =
            await _projectService.DeleteProjectAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    // GET: api/projects/{id}/requirements
    [HttpGet("{id:guid}/requirements")]
    public async Task<ActionResult<List<Requirement>>> GetProjectRequirements(
        Guid id, 
        [FromServices] RequirementService requirementService)
    {
        var requirements = await requirementService.GetRequirementsByProjectAsync(id);
        return Ok(requirements);
    }

    // GET: api/projects/{id}/analysis-summary
    [HttpGet("{id:guid}/analysis-summary")]
    public async Task<ActionResult<AnalysisSummaryDto>> GetProjectAnalysisSummary(
        Guid id,
        [FromServices] IAnalysisService analysisService)
    {
        var summary = await analysisService.GetProjectAnalysisSummaryAsync(id);

        if (summary == null)
        {
            return NotFound();
        }

        return Ok(summary);
    }

    // GET: api/projects/{id}/dependencies
    [HttpGet("{id:guid}/dependencies")]
    public async Task<ActionResult<List<IntelliReq.API.Models.Dependency>>> GetProjectDependencies(
        Guid id,
        [FromServices] IDependencyService dependencyService)
    {
        var deps = await dependencyService.GetDependenciesByProjectAsync(id);
        return Ok(deps);
    }

    // GET: api/projects/{id}/dependencies/graph
    [HttpGet("{id:guid}/dependencies/graph")]
    public async Task<ActionResult<DependencyGraphDto>> GetProjectDependencyGraph(
        Guid id,
        [FromServices] IDependencyService dependencyService)
    {
        var graph = await dependencyService.GetDependencyGraphAsync(id);
        return Ok(graph);
    }

    // GET: api/projects/{id}/impact-analysis
    [HttpGet("{id:guid}/impact-analysis")]
    public async Task<IActionResult> GetProjectImpactAnalyses(
        Guid id,
        [FromServices] IImpactAnalysisService impactService)
    {
        var results = await impactService.GetImpactAnalysesForProjectAsync(id);
        return Ok(results);
    }
}