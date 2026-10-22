import api from '../api/axios';

export const wineService = {
  getAllWines: async () => {
    const response = await api.get('/wines');
    return response.data;
  },

  getWineById: async (id) => {
    const response = await api.get(`/wines/${id}`);
    return response.data;
  },

  createWine: async (wineData) => {
    const response = await api.post('/wines', wineData);
    return response.data;
  },

    
addReview: async (wineId, reviewData) => {
    const textValue = reviewData.comments || reviewData.comment || reviewData.text || '';

    const payload = {
        wineId: wineId,
        rating: Number(reviewData.rating),
        comment: textValue,   // Envia en singular
        comments: textValue   // Envia en plural para que coincida con el Schema de Mongoose
    };

    const response = await api.post('/ratings', payload);
    return response.data;
 },

  getReviewsByWine: async (wineId) => {
    const response = await api.get(`/ratings/wine/${wineId}`);
    return response.data;
  },

  toggleLike: async (ratingId) => {
  const response = await api.post(`/ratings/${ratingId}/like`);
  return response.data;
}
};