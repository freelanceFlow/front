import api from '@/lib/api';
import { User, AuthResponse } from '@/types';

export const authService = {
  login: (credentials: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', credentials),

  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    adress?: string;
  }) => api.post<User>('/auth/register', data),

  getMe: () => api.get<User>('/auth/me'),

  updateMe: (data: Partial<User>) => api.patch<User>('/auth/me', data),

  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post<{ logo_url: string }>('/auth/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
