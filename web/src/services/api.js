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

// Redireciona para login em caso de 401 (só se não estiver já em rota pública)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      const isPublic = path === '/login' || path === '/landing' || path.startsWith('/landing');
      if (!isPublic) {
        localStorage.removeItem('orbit_token');
        localStorage.removeItem('orbit_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
