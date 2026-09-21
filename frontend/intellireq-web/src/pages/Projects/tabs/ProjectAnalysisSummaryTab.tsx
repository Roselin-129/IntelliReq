import { useEffect, useState } from 'react';
import {
  BrainCircuit, AlertTriangle, ShieldAlert, Layers,
  CheckCircle2, BarChart3, Users,
} from 'lucide-react';
import { LoadingSpinner, ErrorAlert } from '../../../components/common/Feedback';
import { analysisService } from '../../../services/analysisService';
import type { AnalysisSummary } from '../../../types/analysis';

interface Props {
  projectId: string;
}

// Distribution colors for classification types
const typeColors: Record<string, string> = {
  Functional:    '#6366f1',
  NonFunctional: '#a78bfa',
  Business:      '#10b981',
  Technical:     '#818cf8',
  Security:      '#ef4444',
  Performance:   '#f97316',
};

function fmt(score?: number | null): string {
  if (score == null) return 'N/A';
  const v = score > 1 ? score : score * 100;
  return `${Math.round(v)}%`;
}

function DistBar({ label, count, total, color }: { label: string; count: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="dist-bar-row">
      <span className="dist-bar-label">{label}</span>
      <div className="dist-bar-track">
        <div className="dist-bar-fill" style={{ width: `${pct}%`, background: color ?? 'var(--brand)' }} />
      </div>
      <span className="dist-bar-count">{count}</span>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color?: string }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--radius-sm)',
          background: 'rgba(99,102,241,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {icon}
        </div>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value" style={{ fontSize: 22, color: color ?? 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

export default function ProjectAnalysisSummaryTab({ projectId }: Props) {
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    analysisService
      .getProjectSummary(projectId)
      .then(setSummary)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <LoadingSpinner message="Loading project analysis summary…" />;

  if (error) {
    return (
      <ErrorAlert
        message={error}
        onDismiss={() => setError(null)}
      />
    );
  }

  if (!summary || summary.analyzedRequirements === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon"><BrainCircuit size={26} /></div>
          <h3>No analysis data available</h3>
          <p>
            Open a requirement and click <strong>Run Full Analysis</strong> on its Analysis tab.
            Once requirements are analysed, the project summary will appear here.
          </p>
        </div>
      </div>
    );
  }

  const classTotal = summary.analyzedRequirements;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Top stat row */}
      <div className="grid-4">
        <StatCard
          label="Total Requirements"
          value={summary.totalRequirements}
          icon={<Users size={16} color="var(--brand-light)" />}
          color="var(--brand-light)"
        />
        <StatCard
          label="Analysed"
          value={summary.analyzedRequirements}
          icon={<CheckCircle2 size={16} color="var(--success)" />}
          color="var(--success)"
        />
        <StatCard
          label="High Risk"
          value={summary.highRiskRequirementCount}
          icon={<ShieldAlert size={16} color="var(--danger)" />}
          color="var(--danger)"
        />
        <StatCard
          label="Ambiguous"
          value={summary.ambiguousRequirementCount}
          icon={<AlertTriangle size={16} color="var(--warning)" />}
          color="var(--warning)"
        />
      </div>

      <div className="grid-2">
        {/* Average Scores */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={15} color="var(--text-muted)" />
              <span className="card-title">Average Scores</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Quality Score',    score: summary.averageQualityScore },
              { label: 'Risk Score',       score: summary.averageRiskScore },
              { label: 'Complexity Score', score: summary.averageComplexityScore },
              { label: 'Ambiguity Score',  score: summary.averageAmbiguityScore },
            ].map(({ label, score }) => {
              const v = score == null ? null : score > 1 ? score : score * 100;
              const cls = v == null ? '' : v >= 70 ? 'good' : v >= 40 ? 'ok' : 'bad';
              return (
                <div key={label} className="score-bar-row">
                  <span className="score-bar-label">{label}</span>
                  <div className="score-bar-track">
                    <div className={`score-bar-fill ${cls}`} style={{ width: v == null ? '0%' : `${Math.min(v, 100)}%` }} />
                  </div>
                  <span className="score-bar-value">{fmt(score)}</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div className="stat-label">High Complexity</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#fb923c' }}>{summary.highComplexityRequirementCount}</div>
            </div>
            <div>
              <div className="stat-label">Low Quality</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--danger)' }}>{summary.lowQualityRequirementCount}</div>
            </div>
            <div>
              <div className="stat-label">Unanalysed</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-secondary)' }}>{summary.unanalyzedRequirements}</div>
            </div>
          </div>
        </div>

        {/* Classification Distribution */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={15} color="var(--text-muted)" />
              <span className="card-title">Classification Distribution</span>
            </div>
          </div>

          <div className="dist-bar">
            {[
              { label: 'Functional',    count: summary.functionalRequirements },
              { label: 'Non-Functional',count: summary.nonFunctionalRequirements },
              { label: 'Business',      count: summary.businessRequirements },
              { label: 'Technical',     count: summary.technicalRequirements },
              { label: 'Security',      count: summary.securityRequirements },
              { label: 'Performance',   count: summary.performanceRequirements },
            ].map(({ label, count }) => (
              <DistBar
                key={label}
                label={label}
                count={count}
                total={classTotal}
                color={typeColors[label.replace('-', '')] ?? typeColors[label]}
              />
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            Based on {classTotal} analysed requirement{classTotal !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
