using IntelliReq.API.Data;
using IntelliReq.API.Models;
using Microsoft.EntityFrameworkCore;

namespace IntelliReq.API.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly ApplicationDbContext _context;

    public DocumentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Document> CreateAsync(Document document)
    {
        _context.Documents.Add(document);

        await _context.SaveChangesAsync();

        return document;
    }

    public async Task<List<Document>> GetByProjectIdAsync(Guid projectId)
    {
        return await _context.Documents
            .Where(d => d.ProjectId == projectId)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();
    }

    public async Task<Document?> GetByIdAsync(Guid id)
    {
        return await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var document = await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == id);

        if (document == null)
        {
            return false;
        }

        _context.Documents.Remove(document);

        await _context.SaveChangesAsync();

        return true;
    }
}