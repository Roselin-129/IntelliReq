export interface Project {
  id: string;
  name: string;
  description?: string;
  domain?: string;
  methodology?: string;
  createdAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  domain?: string;
  methodology?: string;
}

export interface UpdateProjectPayload {
  name: string;
  description?: string;
  domain?: string;
  methodology?: string;
}
