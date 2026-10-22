// src/services/userService.js
import api from '../api/axios';

export const userService = {
  // Obtener perfil por ID de usuario
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Seguir / Dejar de seguir usuario
  toggleFollow: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  }
};