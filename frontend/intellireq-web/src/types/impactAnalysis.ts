// Matches backend ChangedFieldDto
export interface ChangedField {
  fieldName: string;
  oldValue?: string | null;
  newValue?: string | null;
}

// Matches backend AffectedRequirementDto
export interface AffectedRequirement {
  id: string;
  requirementCode: string;
  title: string;
  dependencyType: string;
  dependencyConfidence: number;
}

// Matches backend ImpactAnalysisResponseDto
export interface ImpactAnalysisResponse {
  id: string;
  requirementId: string;
  oldVersion: number;
  newVersion: number;
  impactScore: number;
  impactLevel: string; // Low / Medium / High / Critical
  changeSummary: string;
  changedFields: ChangedField[];
  affectedRequirements: AffectedRequirement[];
  relatedDependencies: import('./dependency').DependencyGraphEdge[];
  createdAt: string;
}

// Request payload — matches ImpactAnalysisRequestDto
export interface ImpactAnalysisRequest {
  oldVersion?: number | null;
  newVersion?: number | null;
}
