import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1',
  timeout: 1400000, // 23 minutos — suporta máximo delay de Marte
});

// Injeta o token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('orbit_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redireciona para login em caso de 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('orbit_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
