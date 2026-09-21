import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '../../types/project';
import { ErrorAlert } from '../../components/common/Feedback';

interface Props {
  initial: Project | null;
  loading: boolean;
  error: string | null;
  onSave: (payload: CreateProjectPayload | UpdateProjectPayload) => void;
  onClose: () => void;
}

export default function ProjectModal({ initial, loading, error, onSave, onClose }: Props) {
  const [name, setName]               = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [domain, setDomain]           = useState(initial?.domain ?? '');
  const [methodology, setMethodology] = useState(initial?.methodology ?? '');
  const [nameErr, setNameErr]         = useState('');

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setDescription(initial.description ?? '');
      setDomain(initial.domain ?? '');
      setMethodology(initial.methodology ?? '');
    }
  }, [initial]);

  const validate = () => {
    if (!name.trim()) { setNameErr('Project name is required.'); return false; }
    if (name.trim().length < 3) { setNameErr('Must be at least 3 characters.'); return false; }
    if (name.trim().length > 100) { setNameErr('Must be 100 characters or fewer.'); return false; }
    setNameErr('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      domain: domain.trim() || undefined,
      methodology: methodology.trim() || undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{initial ? 'Edit Project' : 'New Project'}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <ErrorAlert message={error} />}

            <div className="form-group">
              <label className="form-label">
                Project Name <span className="required">*</span>
              </label>
              <input
                id="project-name-input"
                className="form-input"
                placeholder="e.g. E-Commerce Platform"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              {nameErr && <span className="form-error">{nameErr}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Brief project description…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
              <span className="form-hint">{description.length}/500 characters</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Domain</label>
                <input
                  className="form-input"
                  placeholder="e.g. Healthcare"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Methodology</label>
                <input
                  className="form-input"
                  placeholder="e.g. Agile"
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                  maxLength={50}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="save-project-btn" disabled={loading}>
              {loading ? (initial ? 'Saving…' : 'Creating…') : initial ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
