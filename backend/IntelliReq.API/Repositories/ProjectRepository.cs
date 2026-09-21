using IntelliReq.API.Data;
using IntelliReq.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IntelliReq.API.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly ApplicationDbContext _context;

    public ProjectRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Project>> GetAllAsync()
    {
        return await _context.Projects
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Project?> GetByIdAsync(Guid id)
    {
        return await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Project> CreateAsync(Project project)
    {
        _context.Projects.Add(project);

        await _context.SaveChangesAsync();

        return project;
    }

    public async Task<bool> UpdateAsync(Project project)
    {
        var existing = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == project.Id);

        if (existing == null)
        {
            return false;
        }

        existing.Name = project.Name;
        existing.Description = project.Description;
        existing.Domain = project.Domain;
        existing.Methodology = project.Methodology;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return false;
        }

        _context.Projects.Remove(project);

        await _context.SaveChangesAsync();

        return true;
    }
}