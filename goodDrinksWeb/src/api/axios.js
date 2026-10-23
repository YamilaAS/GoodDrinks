
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5003/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// AuthContext registra aquí la función que limpia la sesión.
let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

// Adjuntar el JWT automáticamente.
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

// Centralizar las respuestas de error 401.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Un login fallido no debe borrar automáticamente la sesión
    // por este interceptor.
    const isAuthRequest =
      /\/users\/(login|register)\/?$/.test(url);

    if (status === 401 && !isAuthRequest && localStorage.getItem('token')) {
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);

export default api;
