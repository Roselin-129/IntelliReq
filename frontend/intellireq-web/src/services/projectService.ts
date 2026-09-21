import api from './api';
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '../types/project';
import type { Requirement } from '../types/requirement';

export const projectService = {
  getAll(): Promise<Project[]> {
    return api.get<Project[]>('/Projects').then((r) => r.data);
  },

  getById(id: string): Promise<Project> {
    return api.get<Project>(`/Projects/${id}`).then((r) => r.data);
  },

  create(payload: CreateProjectPayload): Promise<Project> {
    return api.post<Project>('/Projects', payload).then((r) => r.data);
  },

  update(id: string, payload: UpdateProjectPayload): Promise<void> {
    return api.put(`/Projects/${id}`, payload).then(() => undefined);
  },

  delete(id: string): Promise<void> {
    return api.delete(`/Projects/${id}`).then(() => undefined);
  },

  getRequirements(projectId: string): Promise<Requirement[]> {
    return api.get<Requirement[]>(`/Projects/${projectId}/requirements`).then((r) => r.data);
  },
};
