using IntelliReq.API.DTOs;
using IntelliReq.API.Models;
using IntelliReq.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliReq.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DependenciesController : ControllerBase
{
    private readonly IDependencyService _dependencyService;

    public DependenciesController(IDependencyService dependencyService)
    {
        _dependencyService = dependencyService;
    }

    // POST: api/dependencies
    [HttpPost]
    public async Task<ActionResult<Dependency>> CreateDependency(CreateDependencyDto dto)
    {
        var (dependency, error) = await _dependencyService.CreateDependencyAsync(dto);
        if (dependency == null)
            return BadRequest(error);

        return CreatedAtAction(nameof(GetDependency), new { id = dependency.Id }, dependency);
    }

    // GET: api/dependencies/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Dependency>> GetDependency(Guid id)
    {
        var dep = await _dependencyService.GetDependencyByIdAsync(id);
        if (dep == null) return NotFound();
        return Ok(dep);
    }

    // DELETE: api/dependencies/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteDependency(Guid id)
    {
        var deleted = await _dependencyService.DeleteDependencyAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
