using IntelliReq.API.Models;
using IntelliReq.API.Repositories;

namespace IntelliReq.API.Services;

public class DocumentService
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IWebHostEnvironment _environment;

    private readonly string[] _allowedExtensions =
    {
        ".pdf",
        ".docx",
        ".txt"
    };

    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

    public DocumentService(
        IDocumentRepository documentRepository,
        IProjectRepository projectRepository,
        IWebHostEnvironment environment)
    {
        _documentRepository = documentRepository;
        _projectRepository = projectRepository;
        _environment = environment;
    }

    public async Task<Document> UploadDocumentAsync(
        Guid projectId,
        IFormFile file)
    {
        // 1. Check whether the project exists
        var project = await _projectRepository.GetByIdAsync(projectId);

        if (project == null)
        {
            throw new KeyNotFoundException("Project not found.");
        }

        // 2. Check whether a file was provided
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("A file must be selected.");
        }

        // 3. Check file size
        if (file.Length > MaxFileSize)
        {
            throw new ArgumentException(
                "File size cannot exceed 10 MB.");
        }

        // 4. Get file extension
        var extension =
            Path.GetExtension(file.FileName).ToLowerInvariant();

        // 5. Check file type
        if (!_allowedExtensions.Contains(extension))
        {
            throw new ArgumentException(
                "Only PDF, DOCX and TXT files are allowed.");
        }

        // 6. Create project storage directory
        var projectFolder = Path.Combine(
            _environment.ContentRootPath,
            "storage",
            projectId.ToString());

        Directory.CreateDirectory(projectFolder);

        // 7. Generate a unique file name
        var uniqueFileName =
            $"{Guid.NewGuid()}{extension}";

        var filePath = Path.Combine(
            projectFolder,
            uniqueFileName);

        // 8. Save physical file
        await using (var stream = new FileStream(
            filePath,
            FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // 9. Create document record
        var document = new Document
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            FileName = Path.GetFileName(file.FileName),
            FileType = extension.TrimStart('.'),
            FilePath = Path.GetRelativePath(
                _environment.ContentRootPath,
                filePath),
            Version = 1,
            Status = "Uploaded",
            UploadedAt = DateTime.UtcNow
        };

        // 10. Save metadata to PostgreSQL
        return await _documentRepository.CreateAsync(document);
    }

    public async Task<List<Document>> GetProjectDocumentsAsync(
        Guid projectId)
    {
        var project =
            await _projectRepository.GetByIdAsync(projectId);

        if (project == null)
        {
            throw new KeyNotFoundException("Project not found.");
        }

        return await _documentRepository
            .GetByProjectIdAsync(projectId);
    }

    public async Task<Document?> GetDocumentByIdAsync(Guid id)
    {
        return await _documentRepository.GetByIdAsync(id);
    }

    public async Task<bool> DeleteDocumentAsync(Guid id)
    {
        var document =
            await _documentRepository.GetByIdAsync(id);

        if (document == null)
        {
            return false;
        }

        var fullPath = Path.Combine(
            _environment.ContentRootPath,
            document.FilePath);

        // Delete physical file
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        // Delete database record
        return await _documentRepository.DeleteAsync(id);
    }
}