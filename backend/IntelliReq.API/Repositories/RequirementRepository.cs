using IntelliReq.API.Data;
using IntelliReq.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IntelliReq.API.Repositories;

public class RequirementRepository : IRequirementRepository
{
    private readonly ApplicationDbContext _context;

    public RequirementRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Requirement>> GetByProjectIdAsync(Guid projectId)
    {
        return await _context.Requirements
            .Where(r => r.ProjectId == projectId)
            .OrderBy(r => r.RequirementCode)
            .ToListAsync();
    }

    public async Task<Requirement?> GetByIdAsync(Guid id)
    {
        return await _context.Requirements
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Requirement> CreateAsync(Requirement requirement)
    {
        _context.Requirements.Add(requirement);
        await _context.SaveChangesAsync();
        return requirement;
    }

    public async Task<bool> UpdateAsync(Requirement requirement, RequirementVersion previousVersion)
    {
        var existing = await _context.Requirements.FindAsync(requirement.Id);
        if (existing == null)
            return false;
            
        // We attach or update properties
        _context.Entry(existing).CurrentValues.SetValues(requirement);
        
        // Add new version
        _context.RequirementVersions.Add(previousVersion);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var requirement = await _context.Requirements.FindAsync(id);
        if (requirement == null) return false;

        _context.Requirements.Remove(requirement);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<RequirementVersion>> GetVersionsAsync(Guid requirementId)
    {
        return await _context.RequirementVersions
            .Where(rv => rv.RequirementId == requirementId)
            .OrderByDescending(rv => rv.VersionNumber)
            .ToListAsync();
    }

    public async Task<RequirementVersion?> GetVersionAsync(Guid requirementId, int versionNumber)
    {
        return await _context.RequirementVersions
            .FirstOrDefaultAsync(rv => rv.RequirementId == requirementId && rv.VersionNumber == versionNumber);
    }
}
