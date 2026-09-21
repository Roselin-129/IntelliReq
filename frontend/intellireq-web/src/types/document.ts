export interface Document {
  id: string;
  projectId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  version: number;
  status: string;
  uploadedAt: string;
}
