import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Requirement, CreateRequirementPayload, UpdateRequirementPayload } from '../../types/requirement';
import { RequirementTypeValues, RequirementStatusValues, RequirementPriorityValues } from '../../types/requirement';
import type { Document } from '../../types/document';
import { ErrorAlert } from '../../components/common/Feedback';

interface Props {
  projectId: string;
  documents: Document[];
  initial: Requirement | null;
  loading: boolean;
  error: string | null;
  onSave: (payload: CreateRequirementPayload | UpdateRequirementPayload) => void;
  onClose: () => void;
}

export default function RequirementModal({
  projectId, documents, initial, loading, error, onSave, onClose,
}: Props) {
  const isEdit = !!initial;

  const [code, setCode]               = useState(initial?.requirementCode ?? '');
  const [title, setTitle]             = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [sourceText, setSourceText]   = useState(initial?.sourceText ?? '');
  const [type, setType]               = useState(initial?.type ?? 'Functional');
  const [status, setStatus]           = useState(initial?.status ?? 'Draft');
  const [priority, setPriority]       = useState(initial?.priority ?? 'Medium');
  const [documentId, setDocumentId]   = useState<string>(initial?.documentId ?? '');
  const [changeDesc, setChangeDesc]   = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setCode(initial.requirementCode);
      setTitle(initial.title);
      setDescription(initial.description);
      setSourceText(initial.sourceText ?? '');
      setType(initial.type);
      setStatus(initial.status);
      setPriority(initial.priority);
      setDocumentId(initial.documentId ?? '');
    }
  }, [initial]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isEdit && !code.trim()) e.code = 'Requirement code is required.';
    if (!title.trim())           e.title = 'Title is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      const payload: UpdateRequirementPayload = {
        title: title.trim(),
        description: description.trim(),
        type: RequirementTypeValues[type],
        status: RequirementStatusValues[status],
        priority: RequirementPriorityValues[priority],
        changeDescription: changeDesc.trim() || undefined,
      };
      onSave(payload);
    } else {
      const payload: CreateRequirementPayload = {
        projectId,
        documentId: documentId || undefined,
        requirementCode: code.trim(),
        title: title.trim(),
        description: description.trim(),
        type: RequirementTypeValues[type],
        priority: RequirementPriorityValues[priority],
        sourceText: sourceText.trim() || undefined,
      };
      onSave(payload);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            {isEdit ? `Edit ${initial?.requirementCode}` : 'New Requirement'}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {error && <ErrorAlert message={error} />}

            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Requirement Code <span className="required">*</span></label>
                <input
                  id="req-code-input"
                  className="form-input"
                  placeholder="e.g. REQ-001"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoFocus
                />
                {errors.code && <span className="form-error">{errors.code}</span>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Title <span className="required">*</span></label>
              <input
                id="req-title-input"
                className="form-input"
                placeholder="e.g. User Authentication"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus={isEdit}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Detailed requirement description…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Source Text</label>
                <textarea
                  className="form-textarea"
                  placeholder="Original text from the SRS document (used for AI analysis)…"
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  rows={2}
                />
                <span className="form-hint">Used by the AI analysis engine.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  id="req-type-select"
                >
                  {(['Functional','NonFunctional','Business','Technical','Security','Performance'] as const).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as typeof priority)}
                  id="req-priority-select"
                >
                  {(['Low','Medium','High','Critical'] as const).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {isEdit && (
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  id="req-status-select"
                >
                  {(['Draft','Reviewed','Approved','Rejected'] as const).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {!isEdit && documents.length > 0 && (
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Link to Document (optional)</label>
                <select
                  className="form-select"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  id="req-document-select"
                >
                  <option value="">None</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>{d.fileName}</option>
                  ))}
                </select>
              </div>
            )}

            {isEdit && (
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Change Description</label>
                <input
                  className="form-input"
                  placeholder="Brief note about what changed…"
                  value={changeDesc}
                  onChange={(e) => setChangeDesc(e.target.value)}
                />
                <span className="form-hint">Saved to version history.</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="save-req-btn" disabled={loading}>
              {loading ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save Changes' : 'Create Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
