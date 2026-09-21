// Enums matching the backend C# enums exactly
export type RequirementType =
  | 'Functional'
  | 'NonFunctional'
  | 'Business'
  | 'Technical'
  | 'Security'
  | 'Performance';

export type RequirementStatus =
  | 'Draft'
  | 'Reviewed'
  | 'Approved'
  | 'Rejected';

export type RequirementPriority =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical';

export interface Requirement {
  id: string;
  projectId: string;
  documentId?: string;
  requirementCode: string;
  title: string;
  description: string;
  type: RequirementType;
  status: RequirementStatus;
  priority: RequirementPriority;
  version: number;
  createdAt: string;
  updatedAt: string;
  sourceText?: string;
}

export interface RequirementVersion {
  id: string;
  requirementId: string;
  versionNumber: number;
  title: string;
  description: string;
  type: RequirementType;
  status: RequirementStatus;
  priority: RequirementPriority;
  createdAt: string;
  changeDescription?: string;
}

// Payloads sent to backend
export interface CreateRequirementPayload {
  projectId: string;
  documentId?: string;
  requirementCode: string;
  title: string;
  description: string;
  type: number; // enum value (0-5)
  priority: number; // enum value (0-3)
  sourceText?: string;
}

export interface UpdateRequirementPayload {
  title: string;
  description: string;
  type: number;
  status: number;
  priority: number;
  changeDescription?: string;
}

// Enum value maps for sending to backend
export const RequirementTypeValues: Record<RequirementType, number> = {
  Functional: 0,
  NonFunctional: 1,
  Business: 2,
  Technical: 3,
  Security: 4,
  Performance: 5,
};

export const RequirementStatusValues: Record<RequirementStatus, number> = {
  Draft: 0,
  Reviewed: 1,
  Approved: 2,
  Rejected: 3,
};

export const RequirementPriorityValues: Record<RequirementPriority, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
};
