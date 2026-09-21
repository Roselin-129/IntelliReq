import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ListChecks, Edit2, Trash2, Eye } from 'lucide-react';
import { LoadingSpinner, ErrorAlert, SuccessAlert, ConfirmDialog } from '../../../components/common/Feedback';
import {
  RequirementTypeBadge,
  RequirementStatusBadge,
  RequirementPriorityBadge,
} from '../../../components/common/Badges';
import { projectService } from '../../../services/projectService';
import { requirementService } from '../../../services/requirementService';
import { documentService } from '../../../services/documentService';
import type {
  Requirement,
  RequirementType,
  RequirementStatus,
  CreateRequirementPayload,
  UpdateRequirementPayload,
} from '../../../types/requirement';
import type { Document } from '../../../types/document';
import type { Project } from '../../../types/project';
import RequirementModal from '../../Requirements/RequirementModal';

interface Props {
  projectId: string;
  project: Project;
}

export default function ProjectRequirementsTab({ projectId }: Props) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filtered, setFiltered]         = useState<Requirement[]>([]);
  const [documents, setDocuments]       = useState<Document[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [showModal, setShowModal]         = useState(false);
  const [editTarget, setEditTarget]       = useState<Requirement | null>(null);
  const [modalLoading, setModalLoading]   = useState(false);
  const [modalError, setModalError]       = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget]     = useState<Requirement | null>(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      projectService.getRequirements(projectId),
      documentService.getByProject(projectId),
    ])
      .then(([reqs, docs]) => {
        setRequirements(reqs);
        setDocuments(docs);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [projectId]);

  useEffect(() => {
    let result = requirements;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.requirementCode.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q)
      );
    }
    if (typeFilter)   result = result.filter((r) => r.type   === typeFilter);
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    setFiltered(result);
  }, [search, typeFilter, statusFilter, requirements]);

  const openCreate = () => {
    setEditTarget(null);
    setModalError(null);
    setShowModal(true);
  };

  const openEdit = (r: Requirement) => {
    setEditTarget(r);
    setModalError(null);
    setShowModal(true);
  };

  const handleSave = async (payload: CreateRequirementPayload | UpdateRequirementPayload) => {
    setModalLoading(true);
    setModalError(null);
    try {
      if (editTarget) {
        await requirementService.update(editTarget.id, payload as UpdateRequirementPayload);
        setSuccess('Requirement updated.');
      } else {
        await requirementService.create(payload as CreateRequirementPayload);
        setSuccess('Requirement created.');
      }
      setShowModal(false);
      load();
    } catch (e: unknown) {
      setModalError((e as Error).message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await requirementService.delete(deleteTarget.id);
      setSuccess('Requirement deleted.');
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      setError((e as Error).message);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const types: RequirementType[]     = ['Functional','NonFunctional','Business','Technical','Security','Performance'];
  const statuses: RequirementStatus[] = ['Draft','Reviewed','Approved','Rejected'];

  return (
    <div>
      {error   && <ErrorAlert   message={error}   onDismiss={() => setError(null)} />}
      {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar">
          <Search size={14} />
          <input
            className="search-input"
            placeholder="Search requirements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="req-search"
          />
        </div>

        <select
          className="form-select"
          style={{ width: 160, padding: '8px 32px 8px 12px' }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          id="req-type-filter"
        >
          <option value="">All Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          className="form-select"
          style={{ width: 160, padding: '8px 32px 8px 12px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          id="req-status-filter"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={openCreate} id="create-req-btn">
          <Plus size={14} /> Add Requirement
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading requirements…" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><ListChecks size={26} /></div>
          <h3>{search || typeFilter || statusFilter ? 'No matching requirements' : 'No requirements yet'}</h3>
          <p>
            {search || typeFilter || statusFilter
              ? 'Try adjusting your search or filters.'
              : 'Add the first requirement for this project.'}
          </p>
          {!search && !typeFilter && !statusFilter && (
            <button className="btn btn-primary btn-sm" onClick={openCreate}>
              <Plus size={13} /> Add Requirement
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Version</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--brand-light)', fontWeight: 600 }}>
                      {req.requirementCode}
                    </span>
                  </td>
                  <td style={{ maxWidth: 280 }}>
                    <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.title}
                    </div>
                  </td>
                  <td><RequirementTypeBadge type={req.type} /></td>
                  <td><RequirementStatusBadge status={req.status} /></td>
                  <td><RequirementPriorityBadge priority={req.priority} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>v{req.version}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Link
                        to={`/requirements/${req.id}`}
                        className="btn btn-ghost btn-sm"
                        title="View details"
                        id={`view-req-${req.id}`}
                      >
                        <Eye size={13} />
                      </Link>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Edit"
                        onClick={() => openEdit(req)}
                        id={`edit-req-${req.id}`}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                        title="Delete"
                        onClick={() => setDeleteTarget(req)}
                        id={`delete-req-${req.id}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <RequirementModal
          projectId={projectId}
          documents={documents}
          initial={editTarget}
          loading={modalLoading}
          error={modalError}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Requirement"
          message={`Delete "${deleteTarget.requirementCode} — ${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
