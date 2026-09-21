// Matches backend DependencyResponseDto exactly
export interface DependencyResponse {
  id: string;
  projectId: string;
  sourceRequirementId: string;
  targetRequirementId: string;
  dependencyType: string;
  confidence: number;
  createdAt: string;
}

// Matches backend DependencyGraphNodeDto
export interface DependencyGraphNode {
  id: string;
  requirementId: string;
  requirementCode: string;
  title: string;
}

// Matches backend DependencyGraphEdgeDto
export interface DependencyGraphEdge {
  id: string;
  source: string;
  target: string;
  sourceRequirementId: string;
  targetRequirementId: string;
  dependencyType: string;
  confidence: number;
}

// Matches backend DependencyGraphDto
export interface DependencyGraph {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
}

// Payload for creating a dependency
export interface CreateDependencyPayload {
  projectId: string;
  sourceRequirementId: string;
  targetRequirementId: string;
  dependencyType: number; // enum int value
  confidence: number;
}
