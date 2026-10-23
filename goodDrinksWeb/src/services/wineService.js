
import api from '../api/axios';

// Servicio de vinos y reseñas.
// Todas las peticiones utilizan la instancia compartida de Axios.
export const wineService = {
  getAllWines: async () => {
    const response = await api.get('/wines');
    return response.data;
  },

  getWineById: async (id) => {
    const response = await api.get(`/wines/${id}`);
    return response.data;
  },



  updateReview: async (ratingId, reviewData) => {
    const response = await api.put(`/ratings/${ratingId}`, reviewData);
    return response.data;
  },

  deleteReview: async (ratingId) => {
    const response = await api.delete(`/ratings/${ratingId}`);
    return response.data;
  },



  createWine: async (wineData) => {
    const response = await api.post('/wines', wineData);
    return response.data;
  },

  addReview: async (wineId, reviewData) => {
    const textValue =
      reviewData.comments ??
      reviewData.comment ??
      reviewData.text ??
      '';

    const payload = {
      wineId,
      rating: Number(reviewData.rating),
      comment: textValue,
      comments: textValue,
    };

    const response = await api.post('/ratings', payload);
    return response.data;
  },

  getReviewsByWine: async (wineId) => {
    const response = await api.get(`/ratings/wine/${wineId}`);
    return response.data;
  },


  getReviewsByWineIds: async (wineIds) => {
    const response = await api.post('/ratings/batch', { wineIds });
    return response.data;
 },


  toggleLike: async (ratingId) => {
    const response = await api.post(`/ratings/${ratingId}/like`);
    return response.data;
  },
};

export default api;
