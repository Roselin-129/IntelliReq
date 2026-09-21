import { useEffect, useState } from 'react';
import { GitBranch, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, Clock } from 'lucide-react';
import { LoadingSpinner, ErrorAlert, SuccessAlert } from '../../../components/common/Feedback';
import { impactAnalysisService } from '../../../services/impactAnalysisService';
import { projectService } from '../../../services/projectService';
import type { ImpactAnalysisResponse } from '../../../types/impactAnalysis';
import type { Requirement } from '../../../types/requirement';

interface Props {
  projectId: string;
}

function levelBadgeClass(level: string): string {
  const l = level.toLowerCase();
  if (l === 'low')      return 'level-badge-low';
  if (l === 'medium')   return 'level-badge-medium';
  if (l === 'high')     return 'level-badge-high';
  if (l === 'critical') return 'level-badge-critical';
  return 'badge-gray';
}

// Expandable impact analysis result card
function ImpactCard({ result, requirements }: { result: ImpactAnalysisResponse; requirements: Requirement[] }) {
  const [expanded, setExpanded] = useState(false);
  const req = requirements.find(r => r.id === result.requirementId);

  const scoreColor = result.impactScore >= 70 ? 'var(--danger)'
    : result.impactScore >= 40 ? '#fb923c'
    : result.impactScore >= 20 ? 'var(--warning)'
    : 'var(--success)';

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      {/* Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexWrap: 'wrap' }}
        onClick={() => setExpanded((e) => !e)}
      >
        <div style={{
          width: 52, height: 52, borderRadius: 'var(--radius)',
          background: 'var(--bg-elevated)', border: '2px solid',
          borderColor: scoreColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontWeight: 700, fontSize: 16, color: scoreColor,
        }}>
          {Math.round(result.impactScore)}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <code style={{ fontSize: 12.5, color: 'var(--brand-light)', fontWeight: 700 }}>
              {req?.requirementCode ?? result.requirementId.slice(0, 8)}
            </code>
            <span className={`badge ${levelBadgeClass(result.impactLevel)}`}>{result.impactLevel}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              v{result.oldVersion} → v{result.newVersion}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{result.changeSummary}</div>
          {req && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{req.title}</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} />
            {new Date(result.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {expanded ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: 16 }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 16px' }} />

          {/* Changed fields */}
          {result.changedFields.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Changed Fields
              </div>
              <div className="table-wrapper" style={{ borderRadius: 6 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Previous Value</th>
                      <th>New Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.changedFields.map((f, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500, fontSize: 13 }}>{f.fieldName}</td>
                        <td style={{ color: 'var(--danger)', fontSize: 12.5 }}>{f.oldValue ?? '—'}</td>
                        <td style={{ color: 'var(--success)', fontSize: 12.5 }}>{f.newValue ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Affected requirements */}
          {result.affectedRequirements.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Affected Requirements ({result.affectedRequirements.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.affectedRequirements.map((ar) => (
                  <div key={ar.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--bg-elevated)', padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)', flexWrap: 'wrap',
                  }}>
                    <code style={{ fontSize: 12, color: 'var(--brand-light)', fontWeight: 700 }}>{ar.requirementCode}</code>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{ar.title}</span>
                    <span className="badge badge-indigo">{ar.dependencyType}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {Math.round(ar.dependencyConfidence * 100)}% confidence
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.affectedRequirements.length === 0 && result.changedFields.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>No detailed change data recorded.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Run Impact Analysis Modal ─────────────────────────────────
function RunImpactModal({
  requirements, running, error,
  onRun, onClose,
}: {
  requirements: Requirement[];
  running: boolean;
  error: string | null;
  onRun: (reqId: string, oldV: number | null, newV: number | null) => void;
  onClose: () => void;
}) {
  const [reqId, setReqId]     = useState(requirements[0]?.id ?? '');
  const [oldV, setOldV]       = useState('');
  const [newV, setNewV]       = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Run Impact Analysis</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: 4 }}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Compares two saved versions of a requirement and calculates the impact of the change.
          </div>

          <div className="form-group">
            <label className="form-label">Requirement <span className="required">*</span></label>
            <select className="form-select" value={reqId} onChange={e => setReqId(e.target.value)} id="impact-req-select">
              {requirements.map(r => (
                <option key={r.id} value={r.id}>{r.requirementCode} — {r.title}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Old Version</label>
              <input className="form-input" type="number" min={1} placeholder="Leave blank = auto" value={oldV} onChange={e => setOldV(e.target.value)} />
              <span className="form-hint">Null = compare last two saved versions</span>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Version</label>
              <input className="form-input" type="number" min={1} placeholder="Leave blank = current" value={newV} onChange={e => setNewV(e.target.value)} />
              <span className="form-hint">Null = use current requirement</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={running}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={running || !reqId}
            id="run-impact-btn"
            onClick={() => onRun(
              reqId,
              oldV ? parseInt(oldV) : null,
              newV ? parseInt(newV) : null,
            )}
          >
            {running ? 'Running…' : 'Run Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────
export default function ProjectImpactAnalysisTab({ projectId }: Props) {
  const [results, setResults]         = useState<ImpactAnalysisResponse[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState<string | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [running, setRunning]         = useState(false);
  const [modalError, setModalError]   = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      impactAnalysisService.getForProject(projectId),
      projectService.getRequirements(projectId),
    ])
      .then(([r, reqs]) => {
        setResults(r.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setRequirements(reqs);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [projectId]);

  const handleRun = async (reqId: string, oldV: number | null, newV: number | null) => {
    setRunning(true);
    setModalError(null);
    try {
      await impactAnalysisService.run(reqId, { oldVersion: oldV, newVersion: newV });
      setSuccess('Impact analysis completed.');
      setShowModal(false);
      load();
    } catch (e: unknown) {
      setModalError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading impact analyses…" />;

  return (
    <div>
      {error   && <ErrorAlert   message={error}   onDismiss={() => setError(null)} />}
      {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GitBranch size={18} color="var(--brand-light)" />
          <span style={{ fontSize: 16, fontWeight: 700 }}>Impact Analysis</span>
          {results.length > 0 && <span className="badge badge-indigo">{results.length}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
          {requirements.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={() => { setModalError(null); setShowModal(true); }}
              id="open-impact-modal-btn"
            >
              <GitBranch size={14} /> Run Impact Analysis
            </button>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        <AlertTriangle size={14} style={{ flexShrink: 0 }} />
        <span>
          Impact analysis compares two saved requirement versions and calculates a deterministic impact score based on change magnitude, priority, and dependency count.
        </span>
      </div>

      {results.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><GitBranch size={26} /></div>
            <h3>No impact analyses yet</h3>
            <p>
              Click <strong>Run Impact Analysis</strong> and select a requirement with at least 2 saved versions to compare.
            </p>
          </div>
        </div>
      ) : (
        results.map((r) => (
          <ImpactCard key={r.id} result={r} requirements={requirements} />
        ))
      )}

      {showModal && (
        <RunImpactModal
          requirements={requirements}
          running={running}
          error={modalError}
          onRun={handleRun}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
