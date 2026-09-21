import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderOpen, Edit2, Trash2, ArrowRight, Calendar } from 'lucide-react';
import Topbar from '../../components/layout/Topbar';
import { LoadingSpinner, ErrorAlert, SuccessAlert, ConfirmDialog } from '../../components/common/Feedback';
import { projectService } from '../../services/projectService';
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '../../types/project';
import ProjectModal from './ProjectModal';

export default function ProjectsPage() {
  const [projects, setProjects]       = useState<Project[]>([]);
  const [filtered, setFiltered]       = useState<Project[]>([]);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState<Project | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError]   = useState<string | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    projectService
      .getAll()
      .then((data) => {
        setProjects(data);
        setFiltered(data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? projects.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.description ?? '').toLowerCase().includes(q) ||
              (p.domain ?? '').toLowerCase().includes(q)
          )
        : projects
    );
  }, [search, projects]);

  const openCreate = () => {
    setEditTarget(null);
    setModalError(null);
    setShowModal(true);
  };

  const openEdit = (p: Project) => {
    setEditTarget(p);
    setModalError(null);
    setShowModal(true);
  };

  const handleSave = async (payload: CreateProjectPayload | UpdateProjectPayload) => {
    setModalLoading(true);
    setModalError(null);
    try {
      if (editTarget) {
        await projectService.update(editTarget.id, payload as UpdateProjectPayload);
        setSuccess(`Project "${editTarget.name}" updated.`);
      } else {
        await projectService.create(payload as CreateProjectPayload);
        setSuccess('Project created successfully.');
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
      await projectService.delete(deleteTarget.id);
      setSuccess(`Project "${deleteTarget.name}" deleted.`);
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
    <>
      <Topbar
        title="Projects"
        breadcrumbs={[{ label: 'IntelliReq' }, { label: 'Projects' }]}
      />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-heading">Projects</h1>
            <p className="page-sub">
              {projects.length} project{projects.length !== 1 ? 's' : ''} · Manage your requirement workspaces
            </p>
          </div>
          <button className="btn btn-primary" id="create-project-btn" onClick={openCreate}>
            <Plus size={15} /> New Project
          </button>
        </div>

        {error   && <ErrorAlert   message={error}   onDismiss={() => setError(null)} />}
        {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <div className="search-bar">
            <Search size={15} />
            <input
              className="search-input"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="project-search"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading projects…" size="lg" />
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon"><FolderOpen size={28} /></div>
              <h3>{search ? 'No matching projects' : 'No projects yet'}</h3>
              <p>
                {search
                  ? `No projects match "${search}". Try a different search.`
                  : 'Create your first project to start managing requirements.'}
              </p>
              {!search && (
                <button className="btn btn-primary" onClick={openCreate}>
                  <Plus size={14} /> Create Project
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.map((project) => (
              <div
                key={project.id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {/* Top */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-sm)',
                      background: 'linear-gradient(135deg, var(--brand-dim), rgba(79,70,229,.1))',
                      border: '1px solid rgba(99,102,241,.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: 'var(--brand-light)',
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 2 }}>{project.name}</div>
                    {project.description && (
                      <div
                        style={{
                          fontSize: 12.5,
                          color: 'var(--text-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {project.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {project.domain && (
                    <span className="badge badge-indigo">{project.domain}</span>
                  )}
                  {project.methodology && (
                    <span className="badge badge-purple">{project.methodology}</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  <Calendar size={12} />
                  {new Date(project.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <Link to={`/projects/${project.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    Open <ArrowRight size={12} />
                  </Link>
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Edit project"
                    onClick={() => openEdit(project)}
                    id={`edit-project-${project.id}`}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)' }}
                    title="Delete project"
                    onClick={() => setDeleteTarget(project)}
                    id={`delete-project-${project.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project create/edit modal */}
      {showModal && (
        <ProjectModal
          initial={editTarget}
          loading={modalLoading}
          error={modalError}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Project"
          message={`Are you sure you want to delete "${deleteTarget.name}"? All documents and requirements will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </>
  );
}
