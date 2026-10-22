import api from '../api/axios';

export const authService = {
  // Iniciar sesión
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    const { token, user } = response.data;

    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  // Registrar usuario
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    const { token, user } = response.data;

    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },
};