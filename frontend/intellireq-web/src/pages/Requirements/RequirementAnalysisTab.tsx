import { useEffect, useState } from 'react';
import {
  BrainCircuit, CheckCircle, AlertTriangle, Tag,
  Shield, Layers, RefreshCw, Clock,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/Feedback';
import { analysisService } from '../../services/analysisService';
import type { CombinedAnalysis, RequirementAnalysis } from '../../types/analysis';
import { parseJsonArray } from '../../types/analysis';

interface Props {
  requirementId: string;
}

// ── Helpers ──────────────────────────────────────────────────
function pct(score?: number | null): string {
  if (score == null) return 'N/A';
  const v = score > 1 ? score : score * 100;
  return `${Math.round(v)}%`;
}

function scoreColor(score?: number | null): string {
  if (score == null) return 'score-muted';
  const v = score > 1 ? score / 100 : score;
  if (v >= 0.7) return 'score-good';
  if (v >= 0.4) return 'score-ok';
  return 'score-bad';
}

function levelBadge(level?: string | null): string {
  const l = (level ?? '').toLowerCase();
  if (l === 'low' || l === 'none') return 'level-badge-low';
  if (l === 'medium' || l === 'moderate') return 'level-badge-medium';
  if (l === 'high') return 'level-badge-high';
  if (l === 'critical' || l === 'very high') return 'level-badge-critical';
  return 'badge-gray';
}

function ScoreCircle({ score, label }: { score?: number | null; label?: string }) {
  return (
    <div className="score-ring">
      <div className={`score-circle score-bg ${scoreColor(score)}`}>
        {score == null ? '—' : pct(score)}
      </div>
      {label && <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>{label}</span>}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score?: number | null }) {
  const v = score == null ? 0 : score > 1 ? score : score * 100;
  const cls = v >= 70 ? 'good' : v >= 40 ? 'ok' : 'bad';
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div className={`score-bar-fill ${cls}`} style={{ width: score == null ? '0%' : `${Math.min(v, 100)}%` }} />
      </div>
      <span className="score-bar-value">{pct(score)}</span>
    </div>
  );
}

function IssueList({ items }: { items: string[] }) {
  if (!items.length) return <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>None detected</span>;
  return (
    <ul className="issue-list">
      {items.map((issue, i) => (
        <li key={i} className="issue-item"><span className="issue-dot" />{issue}</li>
      ))}
    </ul>
  );
}

// ── Quality Card ─────────────────────────────────────────────
function QualityCard({ a }: { a: RequirementAnalysis }) {
  const issues = parseJsonArray(a.detectedIssues);
  const parts = a.explanation?.split(':') ?? [];
  const level = parts[0]?.trim() ?? '';
  const recommendations = parts.slice(1).join(':').trim().split('. ').filter(Boolean);

  return (
    <div className="analysis-card">
      <div className="analysis-card-header">
        <div className="analysis-card-icon" style={{ background: 'rgba(16,185,129,.12)' }}>
          <CheckCircle size={18} color="var(--success)" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="analysis-card-title">Quality Analysis</div>
          {level && <div className="analysis-card-sub">{level}</div>}
        </div>
        <ScoreCircle score={a.overallScore} />
      </div>

      <hr className="analysis-divider" />

      <div className="score-bar-wrap">
        <ScoreBar label="Completeness" score={a.completenessScore} />
        <ScoreBar label="Clarity" score={a.clarityScore} />
        <ScoreBar label="Testability" score={a.testabilityScore} />
        {a.consistencyScore != null && <ScoreBar label="Consistency" score={a.consistencyScore} />}
      </div>

      {issues.length > 0 && (
        <>
          <hr className="analysis-divider" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Detected Issues</div>
            <IssueList items={issues} />
          </div>
        </>
      )}

      {recommendations.length > 0 && (
        <>
          <hr className="analysis-divider" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Recommendations</div>
            <IssueList items={recommendations} />
          </div>
        </>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Clock size={10} /> {new Date(a.createdAt).toLocaleString('en-GB')}
      </div>
    </div>
  );
}

// ── Ambiguity Card ───────────────────────────────────────────
function AmbiguityCard({ a }: { a: RequirementAnalysis }) {
  const indicators = parseJsonArray(a.ambiguousPhrases);
  const level = a.severity ?? 'Unknown';

  return (
    <div className="analysis-card">
      <div className="analysis-card-header">
        <div className="analysis-card-icon" style={{ background: 'rgba(245,158,11,.12)' }}>
          <AlertTriangle size={18} color="var(--warning)" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="analysis-card-title">Ambiguity Analysis</div>
          <div className="analysis-card-sub">
            <span className={`badge ${levelBadge(level)}`}>{level}</span>
          </div>
        </div>
        <div className="score-ring">
          <div className={`score-circle score-bg ${a.overallScore != null && a.overallScore > 0 ? 'score-bad' : 'score-good'}`}>
            {a.overallScore != null ? Math.round(a.overallScore > 1 ? a.overallScore : a.overallScore * 100) : '—'}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ambiguity</span>
        </div>
      </div>

      <hr className="analysis-divider" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Status:</span>
        <span className={`badge ${a.isAmbiguous ? 'badge-red' : 'badge-green'}`}>
          {a.isAmbiguous ? 'Ambiguous' : 'Not Ambiguous'}
        </span>
      </div>

      {indicators.length > 0 && (
        <>
          <hr className="analysis-divider" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Ambiguity Indicators</div>
            <IssueList items={indicators} />
          </div>
        </>
      )}

      {a.explanation && (
        <>
          <hr className="analysis-divider" />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{a.explanation}</p>
        </>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Clock size={10} /> {new Date(a.createdAt).toLocaleString('en-GB')}
      </div>
    </div>
  );
}

// ── Classification Card ──────────────────────────────────────
function ClassificationCard({ a }: { a: RequirementAnalysis }) {
  const conf = a.confidenceScore != null
    ? (a.confidenceScore > 1 ? a.confidenceScore : a.confidenceScore * 100)
    : null;

  return (
    <div className="analysis-card">
      <div className="analysis-card-header">
        <div className="analysis-card-icon" style={{ background: 'rgba(99,102,241,.12)' }}>
          <Tag size={18} color="var(--brand-light)" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="analysis-card-title">Classification</div>
          <div className="analysis-card-sub">AI-predicted requirement type</div>
        </div>
      </div>

      <hr className="analysis-divider" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>Predicted Type</div>
          <span className="badge badge-indigo" style={{ fontSize: 14, padding: '5px 14px' }}>{a.predictedType ?? 'Unknown'}</span>
        </div>
        {conf != null && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>Confidence</div>
            <div className={`score-circle score-circle-sm score-bg ${conf >= 70 ? 'score-good' : conf >= 50 ? 'score-ok' : 'score-bad'}`}>
              {Math.round(conf)}%
            </div>
          </div>
        )}
      </div>

      {a.explanation && (
        <>
          <hr className="analysis-divider" />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{a.explanation}</p>
        </>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Clock size={10} /> {new Date(a.createdAt).toLocaleString('en-GB')}
      </div>
    </div>
  );
}

// ── Risk Card ────────────────────────────────────────────────
function RiskCard({ a }: { a: RequirementAnalysis }) {
  const level = a.level ?? 'Unknown';
  const rawFactors = parseJsonArray(a.factors);

  return (
    <div className="analysis-card">
      <div className="analysis-card-header">
        <div className="analysis-card-icon" style={{ background: 'rgba(239,68,68,.12)' }}>
          <Shield size={18} color="var(--danger)" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="analysis-card-title">Risk Analysis</div>
          <div className="analysis-card-sub">
            <span className={`badge ${levelBadge(level)}`}>{level}</span>
          </div>
        </div>
        <ScoreCircle score={a.overallScore} label="Risk" />
      </div>

      <hr className="analysis-divider" />

      {rawFactors.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>Risk Factors</div>
          <IssueList items={rawFactors} />
        </div>
      )}

      {a.explanation && (
        <>
          <hr className="analysis-divider" />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{a.explanation}</p>
        </>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Clock size={10} /> {new Date(a.createdAt).toLocaleString('en-GB')}
      </div>
    </div>
  );
}

// ── Complexity Card ──────────────────────────────────────────
function ComplexityCard({ a }: { a: RequirementAnalysis }) {
  const level = a.level ?? 'Unknown';
  // factors may be a JSON object (key->value map) or array
  let factorRows: [string, string][] = [];
  try {
    if (a.factors) {
      const parsed = JSON.parse(a.factors);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        factorRows = Object.entries(parsed).map(([k, v]) => [k, String(v)]);
      } else if (Array.isArray(parsed)) {
        factorRows = parsed.map((f, i) => [`Factor ${i + 1}`, String(f)]);
      }
    }
  } catch {
    factorRows = [];
  }

  return (
    <div className="analysis-card">
      <div className="analysis-card-header">
        <div className="analysis-card-icon" style={{ background: 'rgba(59,130,246,.12)' }}>
          <Layers size={18} color="var(--info)" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="analysis-card-title">Complexity Analysis</div>
          <div className="analysis-card-sub">
            <span className={`badge ${levelBadge(level)}`}>{level}</span>
          </div>
        </div>
        <ScoreCircle score={a.overallScore} label="Complexity" />
      </div>

      <hr className="analysis-divider" />

      {factorRows.length > 0 && (
        <div className="table-wrapper" style={{ borderRadius: 6 }}>
          <table>
            <tbody>
              {factorRows.map(([key, val]) => (
                <tr key={key}>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12.5, paddingTop: 8, paddingBottom: 8 }}>{key}</td>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {a.explanation && (
        <>
          <hr className="analysis-divider" />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{a.explanation}</p>
        </>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Clock size={10} /> {new Date(a.createdAt).toLocaleString('en-GB')}
      </div>
    </div>
  );
}

// ── Main Analysis Tab ────────────────────────────────────────
export default function RequirementAnalysisTab({ requirementId }: Props) {
  const [combined, setCombined]   = useState<CombinedAnalysis | null>(null);
  const [loading, setLoading]     = useState(true);
  const [running, setRunning]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const hasAny = combined && (
    combined.quality || combined.ambiguity || combined.classification ||
    combined.risk || combined.complexity
  );

  const load = (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    analysisService
      .getCombined(requirementId)
      .then(setCombined)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [requirementId]);

  const handleRunAll = async () => {
    setRunning(true);
    setError(null);
    try {
      const result = await analysisService.runAll(requirementId);
      setCombined(result);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading analysis…" />;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <BrainCircuit size={18} color="var(--brand-light)" />
            <span style={{ fontSize: 16, fontWeight: 700 }}>Requirement Analysis</span>
          </div>
          {hasAny && combined?.analyzedAt && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> Last analysed {new Date(combined.analyzedAt).toLocaleString('en-GB')}
            </div>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleRunAll}
          disabled={running}
          id="run-analysis-btn"
        >
          <RefreshCw size={14} style={running ? { animation: 'spin .7s linear infinite' } : {}} />
          {running ? 'Running analysis…' : hasAny ? 'Re-run Full Analysis' : 'Run Full Analysis'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      )}

      {!hasAny ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><BrainCircuit size={26} /></div>
            <h3>No analysis available yet</h3>
            <p>Click "Run Full Analysis" to run all 5 analysis types: Quality, Ambiguity, Classification, Risk, and Complexity.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {combined?.quality       && <QualityCard        a={combined.quality} />}
          {combined?.ambiguity     && <AmbiguityCard      a={combined.ambiguity} />}
          {combined?.classification && <ClassificationCard a={combined.classification} />}
          {combined?.risk          && <RiskCard           a={combined.risk} />}
          {combined?.complexity    && <ComplexityCard     a={combined.complexity} />}
        </div>
      )}
    </div>
  );
}
