using IntelliReq.API.Data;
using IntelliReq.API.Models;
using IntelliReq.API.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace IntelliReq.API.Repositories;

public class DependencyRepository : IDependencyRepository
{
    private readonly ApplicationDbContext _context;

    public DependencyRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Dependency?> GetByIdAsync(Guid id)
    {
        return await _context.Dependencies
            .Include(d => d.SourceRequirement)
            .Include(d => d.TargetRequirement)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<List<Dependency>> GetByProjectIdAsync(Guid projectId)
    {
        return await _context.Dependencies
            .Include(d => d.SourceRequirement)
            .Include(d => d.TargetRequirement)
            .Where(d => d.ProjectId == projectId)
            .OrderBy(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Dependency>> GetByRequirementIdAsync(Guid requirementId)
    {
        return await _context.Dependencies
            .Include(d => d.SourceRequirement)
            .Include(d => d.TargetRequirement)
            .Where(d => d.SourceRequirementId == requirementId
                     || d.TargetRequirementId == requirementId)
            .OrderBy(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> ExistsAsync(Guid sourceId, Guid targetId, DependencyType type)
    {
        return await _context.Dependencies
            .AnyAsync(d => d.SourceRequirementId == sourceId
                        && d.TargetRequirementId == targetId
                        && d.DependencyType == type);
    }

    public async Task<Dependency> CreateAsync(Dependency dependency)
    {
        _context.Dependencies.Add(dependency);
        await _context.SaveChangesAsync();
        return dependency;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var dep = await _context.Dependencies.FindAsync(id);
        if (dep == null) return false;

        _context.Dependencies.Remove(dep);
        await _context.SaveChangesAsync();
        return true;
    }
}
