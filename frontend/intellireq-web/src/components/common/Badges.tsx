import type { RequirementType, RequirementStatus, RequirementPriority } from '../../types/requirement';

// ── Requirement Type Badge ───────────────────────────────────
const typeClass: Record<RequirementType, string> = {
  Functional:    'badge-blue',
  NonFunctional: 'badge-purple',
  Business:      'badge-green',
  Technical:     'badge-indigo',
  Security:      'badge-red',
  Performance:   'badge-orange',
};

export function RequirementTypeBadge({ type }: { type: RequirementType }) {
  return <span className={`badge ${typeClass[type] ?? 'badge-gray'}`}>{type}</span>;
}

// ── Requirement Status Badge ─────────────────────────────────
const statusClass: Record<RequirementStatus, string> = {
  Draft:    'badge-gray',
  Reviewed: 'badge-blue',
  Approved: 'badge-green',
  Rejected: 'badge-red',
};

export function RequirementStatusBadge({ status }: { status: RequirementStatus }) {
  return <span className={`badge ${statusClass[status] ?? 'badge-gray'}`}>{status}</span>;
}

// ── Requirement Priority Badge ───────────────────────────────
const priorityClass: Record<RequirementPriority, string> = {
  Low:      'badge-gray',
  Medium:   'badge-yellow',
  High:     'badge-orange',
  Critical: 'badge-red',
};

export function RequirementPriorityBadge({ priority }: { priority: RequirementPriority }) {
  return <span className={`badge ${priorityClass[priority] ?? 'badge-gray'}`}>{priority}</span>;
}

// ── Document status badge ─────────────────────────────────────
export function DocumentStatusBadge({ status }: { status: string }) {
  const cls = status === 'Uploaded' ? 'badge-green'
    : status === 'Processing' ? 'badge-yellow'
    : status === 'Failed' ? 'badge-red'
    : 'badge-gray';
  return <span className={`badge ${cls}`}>{status}</span>;
}
