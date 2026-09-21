import api from './api';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/Auth/login', payload);
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/Auth/register', payload);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/Auth/me');
    return response.data;
  },
};
