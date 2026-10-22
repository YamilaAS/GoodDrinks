import axios from 'axios';

// Instancia base conectada a la URL de tu API en Express
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5003/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Adjunta el JWT automáticamente en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;