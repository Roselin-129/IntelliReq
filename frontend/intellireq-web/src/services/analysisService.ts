import api from './api';
import type { CombinedAnalysis, AnalysisSummary } from '../types/analysis';

export const analysisService = {
  // GET latest combined analysis for a requirement
  getCombined(requirementId: string): Promise<CombinedAnalysis> {
    return api
      .get<CombinedAnalysis>(`/Requirements/${requirementId}/analysis`)
      .then((r) => r.data);
  },

  // POST — run all 5 analyses and save results
  runAll(requirementId: string): Promise<CombinedAnalysis> {
    return api
      .post<CombinedAnalysis>(`/Requirements/${requirementId}/analysis`)
      .then((r) => r.data);
  },

  // GET project-level analysis summary
  getProjectSummary(projectId: string): Promise<AnalysisSummary> {
    return api
      .get<AnalysisSummary>(`/Projects/${projectId}/analysis-summary`)
      .then((r) => r.data);
  },
};
