// Matches backend RequirementAnalysis model exactly
export interface RequirementAnalysis {
  id: string;
  requirementId: string;
  analysisType: string; // "Quality" | "Ambiguity" | "Classification" | "Risk" | "Complexity"

  // Generic score (usage depends on analysisType)
  overallScore?: number | null;

  // Quality fields
  completenessScore?: number | null;
  clarityScore?: number | null;
  testabilityScore?: number | null;
  consistencyScore?: number | null;
  detectedIssues?: string | null; // JSON array of strings

  // Ambiguity fields
  isAmbiguous?: boolean | null;
  ambiguousPhrases?: string | null; // JSON array of strings
  severity?: string | null;

  // Classification fields
  predictedType?: string | null;
  confidenceScore?: number | null;

  // Risk & Complexity fields
  level?: string | null;
  factors?: string | null; // JSON array of strings or objects

  explanation?: string | null;
  createdAt: string;
}

// Matches backend RequirementInfoDto
export interface RequirementInfoDto {
  id: string;
  projectId: string;
  requirementCode: string;
  title: string;
  description: string;
  sourceText?: string | null;
}

// Matches backend CombinedRequirementAnalysisDto
export interface CombinedAnalysis {
  requirement: RequirementInfoDto;
  classification?: RequirementAnalysis | null;
  quality?: RequirementAnalysis | null;
  ambiguity?: RequirementAnalysis | null;
  risk?: RequirementAnalysis | null;
  complexity?: RequirementAnalysis | null;
  analyzedAt?: string | null;
}

// Matches backend AnalysisSummaryDto
export interface AnalysisSummary {
  projectId: string;
  totalRequirements: number;
  analyzedRequirements: number;
  unanalyzedRequirements: number;

  functionalRequirements: number;
  nonFunctionalRequirements: number;
  businessRequirements: number;
  technicalRequirements: number;
  securityRequirements: number;
  performanceRequirements: number;

  averageQualityScore?: number | null;
  averageAmbiguityScore?: number | null;
  averageRiskScore?: number | null;
  averageComplexityScore?: number | null;

  highRiskRequirementCount: number;
  highComplexityRequirementCount: number;
  ambiguousRequirementCount: number;
  lowQualityRequirementCount: number;
}

// Helper to safely parse JSON arrays stored as strings in backend
export function parseJsonArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Helper to parse factor objects (complexity factors are objects like { key: value })
export function parseJsonObject(value?: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    return {};
  } catch {
    return {};
  }
}
