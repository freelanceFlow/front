import axios from 'axios';
import { storageService } from '@/services/storage.service'; // Importation de ton service

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour injecter le token JWT
api.interceptors.request.use(
  (config) => {
    // Utilise ton service plutôt que localStorage en direct pour rester cohérent
    const token = storageService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 1. On vide le localStorage ET les cookies via ton service
      storageService.clear();

      // 2. On force la redirection vers le login
      // On vérifie qu'on est bien côté navigateur pour éviter les crashs SSR
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
