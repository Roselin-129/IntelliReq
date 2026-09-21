import api from './api';
import type { ImpactAnalysisResponse, ImpactAnalysisRequest } from '../types/impactAnalysis';

export const impactAnalysisService = {
  // POST — run impact analysis for a requirement (compares versions)
  run(requirementId: string, payload: ImpactAnalysisRequest): Promise<ImpactAnalysisResponse> {
    return api
      .post<ImpactAnalysisResponse>(`/Requirements/${requirementId}/impact-analysis`, payload)
      .then((r) => r.data);
  },

  // GET — list all saved impact analyses for a requirement
  getForRequirement(requirementId: string): Promise<ImpactAnalysisResponse[]> {
    return api
      .get<ImpactAnalysisResponse[]>(`/Requirements/${requirementId}/impact-analysis`)
      .then((r) => r.data);
  },

  // GET — list all impact analyses for all requirements in a project
  getForProject(projectId: string): Promise<ImpactAnalysisResponse[]> {
    return api
      .get<ImpactAnalysisResponse[]>(`/Projects/${projectId}/impact-analysis`)
      .then((r) => r.data);
  },
};
