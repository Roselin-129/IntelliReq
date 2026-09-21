import { useEffect, useRef, useState } from 'react';
import { Network, RefreshCw, Calendar } from 'lucide-react';
import { LoadingSpinner, ErrorAlert } from '../../../components/common/Feedback';
import { dependencyService } from '../../../services/dependencyService';
import type { DependencyGraph, DependencyResponse } from '../../../types/dependency';

interface Props {
  projectId: string;
}

// Badge colour per dependency type
function typeBadge(type: string): string {
  const t = type.toLowerCase();
  if (t === 'depends_on' || t === 'dependson') return 'badge-blue';
  if (t === 'blocks')    return 'badge-red';
  if (t === 'includes')  return 'badge-green';
  if (t === 'extends')   return 'badge-purple';
  if (t === 'refines')   return 'badge-yellow';
  return 'badge-gray';
}

// ── Simple Canvas Graph ───────────────────────────────────────
function DependencyGraphView({ graph }: { graph: DependencyGraph }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Assign stable positions to nodes using a simple circle layout
  const positions: Record<string, { x: number; y: number }> = {};
  const n = graph.nodes.length;
  const cx = 440, cy = 200, r = Math.min(160, 40 + n * 20);
  graph.nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    positions[node.id] = {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    // Draw edges
    graph.edges.forEach((edge) => {
      const src = positions[edge.source];
      const tgt = positions[edge.target];
      if (!src || !tgt) return;

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.strokeStyle = 'rgba(99,102,241,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow head
      const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
      const arrowLen = 10;
      ctx.beginPath();
      ctx.moveTo(tgt.x, tgt.y);
      ctx.lineTo(
        tgt.x - arrowLen * Math.cos(angle - 0.4),
        tgt.y - arrowLen * Math.sin(angle - 0.4),
      );
      ctx.lineTo(
        tgt.x - arrowLen * Math.cos(angle + 0.4),
        tgt.y - arrowLen * Math.sin(angle + 0.4),
      );
      ctx.closePath();
      ctx.fillStyle = 'rgba(99,102,241,0.7)';
      ctx.fill();

      // Confidence label
      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2;
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(139,146,167,0.9)';
      ctx.fillText(`${Math.round(edge.confidence * 100)}%`, mx + 4, my - 4);
    });

    // Draw nodes
    graph.nodes.forEach((node) => {
      const pos = positions[node.id];
      if (!pos) return;

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 26, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(30,37,53,0.95)';
      ctx.fill();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Requirement code
      ctx.font = 'bold 11px Inter, monospace';
      ctx.fillStyle = '#818cf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const shortCode = node.requirementCode.length > 8
        ? node.requirementCode.slice(0, 8)
        : node.requirementCode;
      ctx.fillText(shortCode, pos.x, pos.y);

      // Title below node
      ctx.font = '9px Inter, sans-serif';
      ctx.fillStyle = 'rgba(139,146,167,0.85)';
      const maxLen = 14;
      const title = node.title.length > maxLen ? node.title.slice(0, maxLen) + '…' : node.title;
      ctx.fillText(title, pos.x, pos.y + 36);
    });
  }, [graph]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 360, display: 'block' }}
    />
  );
}

// ── Main Tab ──────────────────────────────────────────────────
export default function ProjectDependenciesTab({ projectId }: Props) {
  const [deps, setDeps]         = useState<DependencyResponse[]>([]);
  const [graph, setGraph]       = useState<DependencyGraph | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [view, setView]         = useState<'table' | 'graph'>('table');

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      dependencyService.getByProject(projectId),
      dependencyService.getGraph(projectId),
    ])
      .then(([d, g]) => {
        setDeps(d);
        setGraph(g);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [projectId]);

  if (loading) return <LoadingSpinner message="Loading dependencies…" />;

  return (
    <div>
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Network size={18} color="var(--brand-light)" />
          <span style={{ fontSize: 16, fontWeight: 700 }}>Dependencies</span>
          {deps.length > 0 && (
            <span className="badge badge-indigo">{deps.length}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {graph && graph.nodes.length > 0 && (
            <>
              <button
                className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setView('table')}
              >
                Table
              </button>
              <button
                className={`btn btn-sm ${view === 'graph' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setView('graph')}
              >
                Graph
              </button>
            </>
          )}
          <button className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {deps.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Network size={26} /></div>
            <h3>No dependencies found</h3>
            <p>Requirement dependencies are detected when impact analysis is run or created manually via the API.</p>
          </div>
        </div>
      ) : view === 'graph' && graph ? (
        <>
          {/* Graph legend */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 24, height: 2, background: '#6366f1', display: 'inline-block', borderRadius: 1 }} />
              Dependency edge (dashed)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #6366f1', display: 'inline-block' }} />
              Requirement node
            </span>
            <span>% = dependency confidence</span>
          </div>
          <div className="dep-graph-container" style={{ padding: 0 }}>
            <DependencyGraphView graph={graph} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
            {graph.nodes.length} nodes · {graph.edges.length} edges
          </div>
        </>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Source Requirement</th>
                <th>Target Requirement</th>
                <th>Type</th>
                <th>Confidence</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {deps.map((dep) => {
                const srcNode = graph?.nodes.find(n => n.requirementId === dep.sourceRequirementId);
                const tgtNode = graph?.nodes.find(n => n.requirementId === dep.targetRequirementId);
                return (
                  <tr key={dep.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <code style={{ fontSize: 12, color: 'var(--brand-light)', fontWeight: 600 }}>
                          {srcNode?.requirementCode ?? dep.sourceRequirementId.slice(0, 8)}
                        </code>
                        {srcNode && (
                          <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {srcNode.title}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <code style={{ fontSize: 12, color: 'var(--brand-light)', fontWeight: 600 }}>
                          {tgtNode?.requirementCode ?? dep.targetRequirementId.slice(0, 8)}
                        </code>
                        {tgtNode && (
                          <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tgtNode.title}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${typeBadge(dep.dependencyType)}`}>
                        {dep.dependencyType}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 48, height: 5, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.round(dep.confidence * 100)}%`, height: '100%', background: 'var(--brand)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {Math.round(dep.confidence * 100)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Calendar size={11} />
                        {new Date(dep.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
