using IntelliReq.API.Models;

namespace IntelliReq.API.Repositories;

public interface IDocumentRepository
{
    Task<Document> CreateAsync(Document document);

    Task<List<Document>> GetByProjectIdAsync(Guid projectId);

    Task<Document?> GetByIdAsync(Guid id);

    Task<bool> DeleteAsync(Guid id);
}