import { useEffect, useState, useRef } from 'react';
import { Upload, FileText, Trash2, Clock } from 'lucide-react';
import { LoadingSpinner, ErrorAlert, SuccessAlert, ConfirmDialog } from '../../../components/common/Feedback';
import { DocumentStatusBadge } from '../../../components/common/Badges';
import { documentService } from '../../../services/documentService';
import type { Document } from '../../../types/document';

const ACCEPTED_TYPES = '.txt,.pdf,.doc,.docx,.md';
const MAX_SIZE_MB = 10;

interface Props {
  projectId: string;
}

export default function ProjectDocumentsTab({ projectId }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);

  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver]       = useState(false);

  const [deleteTarget, setDeleteTarget]     = useState<Document | null>(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    documentService
      .getByProject(projectId)
      .then(setDocuments)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [projectId]);

  const handleFile = async (file: File) => {
    setUploadError(null);

    // Basic client-side validation
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > MAX_SIZE_MB) {
      setUploadError(`File is too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    setUploading(true);
    try {
      await documentService.upload(projectId, file);
      setSuccess(`"${file.name}" uploaded successfully.`);
      load();
    } catch (e: unknown) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await documentService.delete(projectId, deleteTarget.id);
      setSuccess(`"${deleteTarget.fileName}" deleted.`);
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      setError((e as Error).message);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {error   && <ErrorAlert   message={error}   onDismiss={() => setError(null)} />}
      {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

      {/* Upload zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        style={{ marginBottom: 24 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          style={{ display: 'none' }}
          onChange={handleInputChange}
          id="document-file-input"
        />
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div className="spinner spinner-lg" />
            <span style={{ color: 'var(--text-secondary)' }}>Uploading…</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Upload size={32} color="var(--text-muted)" />
            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
              Drag & drop a file, or click to browse
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Supported formats: .txt, .pdf, .doc, .docx, .md · Max {MAX_SIZE_MB} MB
            </div>
          </div>
        )}
      </div>

      {uploadError && <ErrorAlert message={uploadError} onDismiss={() => setUploadError(null)} />}

      {/* Documents table */}
      {loading ? (
        <LoadingSpinner message="Loading documents…" />
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText size={26} /></div>
          <h3>No documents yet</h3>
          <p>Upload an SRS document to get started with requirement extraction.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Version</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileText size={15} color="var(--warning)" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{doc.fileName}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>
                      {doc.fileType || '—'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>v{doc.version}</td>
                  <td><DocumentStatusBadge status={doc.status} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Clock size={11} />
                      {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Delete document"
                      onClick={() => setDeleteTarget(doc)}
                      id={`delete-doc-${doc.id}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Document"
          message={`Delete "${deleteTarget.fileName}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
