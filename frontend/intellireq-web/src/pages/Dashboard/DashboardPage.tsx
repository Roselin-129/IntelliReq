import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  ListChecks,
  FileText,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Topbar from '../../components/layout/Topbar';
import { LoadingSpinner, ErrorAlert } from '../../components/common/Feedback';
import { projectService } from '../../services/projectService';
import type { Project } from '../../types/project';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    projectService
      .getAll()
      .then(setProjects)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const recentProjects = projects.slice(0, 5);

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="page-body">
        {/* Welcome banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,.2), rgba(79,70,229,.1))',
            border: '1px solid rgba(99,102,241,.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 32px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
              Welcome to IntelliReq
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
              AI-powered requirement intelligence — manage, analyse, and improve your software requirements.
            </p>
          </div>
          <Link to="/projects" className="btn btn-primary">
            <FolderOpen size={15} /> Browse Projects
          </Link>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* Stats */}
        {!loading && (
          <div className="grid-3" style={{ marginBottom: 28 }}>
            <div className="stat-card">
              <div className="stat-label">Total Projects</div>
              <div className="stat-value">{projects.length}</div>
              <div className="stat-sub">across all workspaces</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Status</div>
              <div className="stat-value" style={{ color: 'var(--success)', fontSize: 20, paddingTop: 4 }}>
                Operational
              </div>
              <div className="stat-sub">Backend + AI service</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">AI Service</div>
              <div className="stat-value" style={{ color: 'var(--brand-light)', fontSize: 20, paddingTop: 4 }}>
                FastAPI
              </div>
              <div className="stat-sub">Deterministic NLP</div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid-3" style={{ marginBottom: 28 }}>
          {[
            {
              icon: <FolderOpen size={22} color="var(--brand-light)" />,
              title: 'Projects',
              desc: 'Create and manage requirement projects.',
              to: '/projects',
            },
            {
              icon: <ListChecks size={22} color="var(--success)" />,
              title: 'Requirements',
              desc: 'Browse and manage all requirements.',
              to: '/requirements',
            },
            {
              icon: <FileText size={22} color="var(--warning)" />,
              title: 'Documents',
              desc: 'Upload and manage SRS documents.',
              to: '/documents',
            },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'border-color .2s, transform .15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--brand)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLDivElement).style.transform = '';
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-light)', fontSize: 13 }}>
                  Go <ArrowRight size={13} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent projects */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={15} color="var(--text-muted)" />
              <span className="card-title">Recent Projects</span>
            </div>
            <Link to="/projects" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading projects…" />
          ) : recentProjects.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 24px' }}>
              <div className="empty-state-icon"><FolderOpen size={24} /></div>
              <h3>No projects yet</h3>
              <p>Create your first project to get started.</p>
              <Link to="/projects" className="btn btn-primary btn-sm">Create Project</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Domain</th>
                    <th>Methodology</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        {p.description && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.domain ?? '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.methodology ?? '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Link to={`/projects/${p.id}`} className="btn btn-secondary btn-sm">
                          Open <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI features teaser */}
        <div
          style={{
            marginTop: 24,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <TrendingUp size={32} color="var(--brand-light)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>AI Analysis — Live</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Quality scoring · Ambiguity detection · Risk analysis · Complexity scoring · Dependency graph · Impact analysis
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
