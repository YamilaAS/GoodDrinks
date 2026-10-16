const ratingRepository = require('../repositories/ratingRepository');

class RatingService {
  async createRating(userId, ratingData) {
    const { wineId, rating, comments } = ratingData;

    const existingRating = await ratingRepository.findByUserAndWine(userId, wineId);
    if (existingRating) {
      const error = new Error('Ya has calificado este vino anteriormente.');
      error.statusCode = 400;
      throw error;
    }

    return await ratingRepository.create({
      user: userId,
      wine: wineId,
      rating,
      comments
    });
  }

  async getRatingsByWine(wineId) {
    return await ratingRepository.findByWineId(wineId);
  }

  async updateRating(ratingId, userId, updateData) {
    const existingRating = await ratingRepository.findByIdAndUser(ratingId, userId);
    if (!existingRating) {
      const error = new Error('Calificación no encontrada o no tienes permisos');
      error.statusCode = 404;
      throw error;
    }

    if (updateData.rating !== undefined) existingRating.rating = updateData.rating;
    if (updateData.comments !== undefined) existingRating.comments = updateData.comments;

    return await existingRating.save();
  }

  async deleteRating(ratingId, userId) {
    const deletedRating = await ratingRepository.deleteByIdAndUser(ratingId, userId);
    if (!deletedRating) {
      const error = new Error('Calificación no encontrada o no tienes permisos');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Calificación eliminada de forma exitosa' };
  }

  async toggleLikeRating(ratingId, userId) {
    const rating = await ratingRepository.findById(ratingId);
    if (!rating) {
      const error = new Error('Reseña no encontrada');
      error.statusCode = 404;
      throw error;
    }

    const hasLiked = rating.likes.includes(userId);
    await ratingRepository.toggleLike(ratingId, userId, hasLiked);

    return {
      message: hasLiked ? 'Like removido' : 'Reseña cliqueada con Like con éxito'
    };
  }
}

module.exports = new RatingService();