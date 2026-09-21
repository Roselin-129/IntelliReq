import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FolderOpen, FileText, ListChecks, Calendar,
  Globe, Cpu, BrainCircuit, Network, GitBranch,
} from 'lucide-react';
import Topbar from '../../components/layout/Topbar';
import { LoadingSpinner, ErrorAlert } from '../../components/common/Feedback';
import { projectService } from '../../services/projectService';
import type { Project } from '../../types/project';
import ProjectDocumentsTab     from './tabs/ProjectDocumentsTab';
import ProjectRequirementsTab  from './tabs/ProjectRequirementsTab';
import ProjectAnalysisSummaryTab from './tabs/ProjectAnalysisSummaryTab';
import ProjectDependenciesTab  from './tabs/ProjectDependenciesTab';
import ProjectImpactAnalysisTab from './tabs/ProjectImpactAnalysisTab';

type Tab = 'overview' | 'documents' | 'requirements' | 'analysis' | 'dependencies' | 'impact';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',      label: 'Overview',        icon: <FolderOpen size={14} /> },
  { id: 'documents',     label: 'Documents',       icon: <FileText size={14} /> },
  { id: 'requirements',  label: 'Requirements',    icon: <ListChecks size={14} /> },
  { id: 'analysis',      label: 'Analysis',        icon: <BrainCircuit size={14} /> },
  { id: 'dependencies',  label: 'Dependencies',    icon: <Network size={14} /> },
  { id: 'impact',        label: 'Impact Analysis', icon: <GitBranch size={14} /> },
];

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate      = useNavigate();

  const [project, setProject]     = useState<Project | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    projectService
      .getById(projectId)
      .then(setProject)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <>
        <Topbar title="Loading…" />
        <div className="page-body"><LoadingSpinner message="Loading project…" size="lg" /></div>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Topbar title="Project" />
        <div className="page-body">
          <ErrorAlert message={error ?? 'Project not found.'} />
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')}>
            <ArrowLeft size={14} /> Back to Projects
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title={project.name}
        breadcrumbs={[
          { label: 'Projects', to: '/projects' },
          { label: project.name },
        ]}
      />
      <div className="page-body">
        {/* Project header card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div
                style={{
                  width: 52, height: 52,
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0,
                }}
              >
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{project.name}</h1>
                {project.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, margin: '0 0 10px', maxWidth: 520 }}>
                    {project.description}
                  </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {project.domain && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Globe size={12} /> {project.domain}
                    </span>
                  )}
                  {project.methodology && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Cpu size={12} /> {project.methodology}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Calendar size={12} />
                    Created {new Date(project.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <Link to="/projects" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
              <ArrowLeft size={13} /> All Projects
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview'      && <OverviewTab project={project} onNavigate={setActiveTab} />}
        {activeTab === 'documents'     && <ProjectDocumentsTab projectId={project.id} />}
        {activeTab === 'requirements'  && <ProjectRequirementsTab projectId={project.id} project={project} />}
        {activeTab === 'analysis'      && <ProjectAnalysisSummaryTab projectId={project.id} />}
        {activeTab === 'dependencies'  && <ProjectDependenciesTab projectId={project.id} />}
        {activeTab === 'impact'        && <ProjectImpactAnalysisTab projectId={project.id} />}
      </div>
    </>
  );
}

// ── Overview Tab ─────────────────────────────────────────────
function OverviewTab({ project, onNavigate }: { project: Project; onNavigate: (tab: Tab) => void }) {
  return (
    <div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[
          { label: 'Project ID',  value: project.id.slice(0, 8) + '…', mono: true },
          { label: 'Domain',      value: project.domain ?? '—' },
          { label: 'Methodology', value: project.methodology ?? '—' },
        ].map((item) => (
          <div key={item.label} className="card" style={{ padding: '16px 20px' }}>
            <div className="stat-label">{item.label}</div>
            <div style={{ marginTop: 6, fontWeight: 500, fontSize: 14, fontFamily: item.mono ? 'monospace' : undefined }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('documents')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <FileText size={18} color="var(--warning)" />
            <span style={{ fontWeight: 600 }}>Documents</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, margin: 0 }}>
            View and upload SRS documents for this project.
          </p>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('requirements')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <ListChecks size={18} color="var(--success)" />
            <span style={{ fontWeight: 600 }}>Requirements</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, margin: 0 }}>
            Create, edit, and manage project requirements.
          </p>
        </div>
      </div>

      <div className="grid-3">
        <div className="card" style={{ cursor: 'pointer', borderColor: 'rgba(99,102,241,.25)', background: 'rgba(99,102,241,.04)' }} onClick={() => onNavigate('analysis')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <BrainCircuit size={18} color="var(--brand-light)" />
            <span style={{ fontWeight: 600 }}>Analysis</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, margin: 0 }}>
            View quality, risk, and complexity summaries.
          </p>
        </div>
        <div className="card" style={{ cursor: 'pointer', borderColor: 'rgba(59,130,246,.25)', background: 'rgba(59,130,246,.04)' }} onClick={() => onNavigate('dependencies')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Network size={18} color="var(--info)" />
            <span style={{ fontWeight: 600 }}>Dependencies</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, margin: 0 }}>
            Visualise requirement dependency graph.
          </p>
        </div>
        <div className="card" style={{ cursor: 'pointer', borderColor: 'rgba(16,185,129,.25)', background: 'rgba(16,185,129,.04)' }} onClick={() => onNavigate('impact')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <GitBranch size={18} color="var(--success)" />
            <span style={{ fontWeight: 600 }}>Impact Analysis</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, margin: 0 }}>
            Analyse the impact of requirement changes.
          </p>
        </div>
      </div>
    </div>
  );
}
