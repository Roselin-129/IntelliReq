import api from './api';
import type {
  Requirement,
  RequirementVersion,
  CreateRequirementPayload,
  UpdateRequirementPayload,
} from '../types/requirement';

export const requirementService = {
  getById(id: string): Promise<Requirement> {
    return api.get<Requirement>(`/Requirements/${id}`).then((r) => r.data);
  },

  create(payload: CreateRequirementPayload): Promise<Requirement> {
    return api.post<Requirement>('/Requirements', payload).then((r) => r.data);
  },

  update(id: string, payload: UpdateRequirementPayload): Promise<void> {
    return api.put(`/Requirements/${id}`, payload).then(() => undefined);
  },

  delete(id: string): Promise<void> {
    return api.delete(`/Requirements/${id}`).then(() => undefined);
  },

  getVersions(id: string): Promise<RequirementVersion[]> {
    return api
      .get<RequirementVersion[]>(`/Requirements/${id}/versions`)
      .then((r) => r.data);
  },

  getVersion(id: string, versionNumber: number): Promise<RequirementVersion> {
    return api
      .get<RequirementVersion>(`/Requirements/${id}/versions/${versionNumber}`)
      .then((r) => r.data);
  },
};
