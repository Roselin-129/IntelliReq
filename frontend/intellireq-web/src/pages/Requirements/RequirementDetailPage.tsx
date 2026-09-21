import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ListChecks, Clock, Activity, Hash,
  FileText, History, BrainCircuit, Network, GitBranch, Info,
} from 'lucide-react';
import Topbar from '../../components/layout/Topbar';
import { LoadingSpinner, ErrorAlert } from '../../components/common/Feedback';
import {
  RequirementTypeBadge,
  RequirementStatusBadge,
  RequirementPriorityBadge,
} from '../../components/common/Badges';
import { requirementService } from '../../services/requirementService';
import type { Requirement, RequirementVersion } from '../../types/requirement';
import RequirementAnalysisTab from './RequirementAnalysisTab';

type Tab = 'overview' | 'analysis' | 'versions' | 'dependencies' | 'impact';

const tabs: { id: Tab; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
  { id: 'overview',     label: 'Overview',        icon: <Info size={14} /> },
  { id: 'analysis',     label: 'Analysis',        icon: <BrainCircuit size={14} /> },
  { id: 'versions',     label: 'Versions',        icon: <History size={14} /> },
  { id: 'dependencies', label: 'Dependencies',    icon: <Network size={14} />,   disabled: true },
  { id: 'impact',       label: 'Impact Analysis', icon: <GitBranch size={14} />, disabled: true },
];

export default function RequirementDetailPage() {
  const { requirementId } = useParams<{ requirementId: string }>();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<Tab>('overview');

  useEffect(() => {
    if (!requirementId) return;
    setLoading(true);
    requirementService
      .getById(requirementId)
      .then(setRequirement)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [requirementId]);

  if (loading) {
    return (
      <>
        <Topbar title="Loading…" />
        <div className="page-body"><LoadingSpinner message="Loading requirement…" size="lg" /></div>
      </>
    );
  }

  if (error || !requirement) {
    return (
      <>
        <Topbar title="Requirement" />
        <div className="page-body">
          <ErrorAlert message={error ?? 'Requirement not found.'} />
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title={requirement.requirementCode}
        breadcrumbs={[
          { label: 'Projects', to: '/projects' },
          { label: requirement.requirementCode },
        ]}
      />
      <div className="page-body">
        {/* Header card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--brand-light)',
                }}
              >
                <ListChecks size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <code style={{ fontSize: 13, color: 'var(--brand-light)', fontWeight: 700 }}>
                    {requirement.requirementCode}
                  </code>
                  <RequirementTypeBadge type={requirement.type} />
                  <RequirementStatusBadge status={requirement.status} />
                  <RequirementPriorityBadge priority={requirement.priority} />
                </div>
                <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>{requirement.title}</h1>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span><Clock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                    Created {new Date(requirement.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span><Activity size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                    Updated {new Date(requirement.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span>Version v{requirement.version}</span>
                </div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={13} /> Back
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              style={tab.disabled ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              {tab.icon}
              {tab.label}
              {tab.disabled && (
                <span style={{ fontSize: 10, background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 4, color: 'var(--text-muted)' }}>
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview'  && <OverviewTab requirement={requirement} />}
        {activeTab === 'analysis'  && <RequirementAnalysisTab requirementId={requirement.id} />}
        {activeTab === 'versions'  && <VersionsTab requirementId={requirement.id} />}
      </div>
    </>
  );
}

// ── Overview Tab ─────────────────────────────────────────────
function OverviewTab({ requirement }: { requirement: Requirement }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Description */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FileText size={15} color="var(--text-muted)" />
          <span className="card-title">Description</span>
        </div>
        {requirement.description ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            {requirement.description}
          </p>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5, fontStyle: 'italic', margin: 0 }}>
            No description provided.
          </p>
        )}
      </div>

      {/* Source text */}
      {requirement.sourceText && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Hash size={15} color="var(--text-muted)" />
            <span className="card-title">Source Text</span>
          </div>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 13.5,
            lineHeight: 1.7,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            margin: 0,
            fontFamily: 'monospace',
          }}>
            {requirement.sourceText}
          </p>
        </div>
      )}

      {/* Metadata grid */}
      <div className="grid-3">
        {[
          { label: 'Type',     value: <RequirementTypeBadge type={requirement.type} /> },
          { label: 'Status',   value: <RequirementStatusBadge status={requirement.status} /> },
          { label: 'Priority', value: <RequirementPriorityBadge priority={requirement.priority} /> },
          { label: 'Version',  value: `v${requirement.version}` },
          { label: 'Created',  value: new Date(requirement.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
          { label: 'Updated',  value: new Date(requirement.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
        ].map((item) => (
          <div key={item.label} className="card" style={{ padding: '14px 18px' }}>
            <div className="stat-label">{item.label}</div>
            <div style={{ marginTop: 6 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Analysis shortcut */}
      <div className="card" style={{ borderColor: 'rgba(99,102,241,.2)', background: 'rgba(99,102,241,.04)', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrainCircuit size={20} color="var(--brand-light)" />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>AI Analysis Available</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Click the <strong>Analysis</strong> tab to run Quality · Ambiguity · Classification · Risk · Complexity analysis.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Versions Tab ─────────────────────────────────────────────
function VersionsTab({ requirementId }: { requirementId: string }) {
  const [versions, setVersions] = useState<RequirementVersion[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    requirementService
      .getVersions(requirementId)
      .then(setVersions)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [requirementId]);

  if (loading) return <LoadingSpinner message="Loading version history…" />;
  if (error)   return <ErrorAlert message={error} />;

  if (versions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><History size={24} /></div>
        <h3>No version history</h3>
        <p>Version history is recorded when you edit this requirement.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {versions
        .sort((a, b) => b.versionNumber - a.versionNumber)
        .map((v) => (
          <div key={v.id} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--brand-light)',
                  }}
                >
                  v{v.versionNumber}
                </span>
                <span style={{ fontWeight: 600 }}>{v.title}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <RequirementTypeBadge type={v.type} />
                <RequirementStatusBadge status={v.status} />
                <RequirementPriorityBadge priority={v.priority} />
              </div>
            </div>

            {v.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 8px', lineHeight: 1.6 }}>
                {v.description}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span><Clock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                {new Date(v.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              {v.changeDescription && (
                <span style={{ color: 'var(--text-secondary)' }}>
                  📝 {v.changeDescription}
                </span>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
