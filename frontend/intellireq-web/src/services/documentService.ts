import api from './api';
import type { Document } from '../types/document';

export const documentService = {
  getByProject(projectId: string): Promise<Document[]> {
    return api
      .get<Document[]>(`/projects/${projectId}/documents`)
      .then((r) => r.data);
  },

  getById(projectId: string, documentId: string): Promise<Document> {
    return api
      .get<Document>(`/projects/${projectId}/documents/${documentId}`)
      .then((r) => r.data);
  },

  upload(projectId: string, file: File): Promise<Document> {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<Document>(`/projects/${projectId}/documents`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  delete(projectId: string, documentId: string): Promise<void> {
    return api
      .delete(`/projects/${projectId}/documents/${documentId}`)
      .then(() => undefined);
  },
};
