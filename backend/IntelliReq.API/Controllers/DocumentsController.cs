using IntelliReq.API.Models;
using IntelliReq.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliReq.API.Controllers;

[ApiController]
[Route("api/projects/{projectId:guid}/documents")]
public class DocumentsController : ControllerBase
{
    private readonly DocumentService _documentService;

    public DocumentsController(DocumentService documentService)
    {
        _documentService = documentService;
    }

    // POST: api/projects/{projectId}/documents
    [HttpPost]
    public async Task<ActionResult<Document>> UploadDocument(
        Guid projectId,
        IFormFile file)
    {
        try
        {
            var document = await _documentService
                .UploadDocumentAsync(projectId, file);

            return Ok(document);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // GET: api/projects/{projectId}/documents
    [HttpGet]
    public async Task<ActionResult<List<Document>>> GetProjectDocuments(
        Guid projectId)
    {
        try
        {
            var documents = await _documentService
                .GetProjectDocumentsAsync(projectId);

            return Ok(documents);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    // GET: api/projects/{projectId}/documents/{documentId}
    [HttpGet("{documentId:guid}")]
    public async Task<ActionResult<Document>> GetDocument(
        Guid projectId,
        Guid documentId)
    {
        var document = await _documentService
            .GetDocumentByIdAsync(documentId);

        if (document == null || document.ProjectId != projectId)
        {
            return NotFound();
        }

        return Ok(document);
    }

    // DELETE: api/projects/{projectId}/documents/{documentId}
    [HttpDelete("{documentId:guid}")]
    public async Task<IActionResult> DeleteDocument(
        Guid projectId,
        Guid documentId)
    {
        var document = await _documentService
            .GetDocumentByIdAsync(documentId);

        if (document == null || document.ProjectId != projectId)
        {
            return NotFound();
        }

        var deleted = await _documentService
            .DeleteDocumentAsync(documentId);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}