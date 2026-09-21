import api from './api';
import type { DependencyResponse, DependencyGraph } from '../types/dependency';

export const dependencyService = {
  // GET all dependencies for a project (list view)
  getByProject(projectId: string): Promise<DependencyResponse[]> {
    return api
      .get<DependencyResponse[]>(`/Projects/${projectId}/dependencies`)
      .then((r) => r.data);
  },

  // GET graph (nodes + edges) for a project
  getGraph(projectId: string): Promise<DependencyGraph> {
    return api
      .get<DependencyGraph>(`/Projects/${projectId}/dependencies/graph`)
      .then((r) => r.data);
  },

  // GET dependencies for a specific requirement
  getByRequirement(requirementId: string): Promise<DependencyResponse[]> {
    return api
      .get<DependencyResponse[]>(`/Requirements/${requirementId}/dependencies`)
      .then((r) => r.data);
  },
};
