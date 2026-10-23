const ratingRepository = require('../repositories/ratingRepository');
const wineRepository = require('../repositories/wineRepository');
const RatingDTO = require('../dtos/ratingDto');

class RatingService {
  async createRating(userId, ratingData) {
    const { wineId, wine, rating, score, comment, comments } = ratingData;
    const targetWineId = wineId || wine;
    const finalRating = rating !== undefined ? rating : score;

    // Extraemos el texto del comentario
    const finalComment = comment || comments || '';

    // Verificar si ya existe calificación del usuario para este vino
    const existingRating = await ratingRepository.findByUserAndWine
      ? await ratingRepository.findByUserAndWine(userId, targetWineId)
      : null;

    if (existingRating) {
      const error = new Error('Ya has calificado este vino');
      error.statusCode = 400;
      throw error;
    }

    const newRating = await ratingRepository.create({
      wine: targetWineId,
      user: userId,
      rating: finalRating,
      score: finalRating,
      comments: finalComment // 👈 CORREGIDO: 'comments' en plural para coincidir con Mongoose Schema
    });

    // Actualizar promedio en el modelo Wine si el método existe
    if (wineRepository.updateAverageRating) {
      await wineRepository.updateAverageRating(targetWineId);
    }

    return RatingDTO.toResponse(newRating);
  }

  async getRatingsByWine(wineId) {
    const ratings = await ratingRepository.findByWineId
      ? await ratingRepository.findByWineId(wineId)
      : await ratingRepository.findByWine(wineId);
    return RatingDTO.toResponseList(ratings);
  }


  async getRatingsByWineIds(wineIds) {
    const ratings = await ratingRepository.findByWineIds(wineIds);
    return RatingDTO.toResponseList(ratings);
  }


  async updateRating(ratingId, userId, updateData) {
    const updated = await ratingRepository.update(ratingId, userId, updateData);
    if (!updated) {
      const error = new Error('Reseña no encontrada o no autorizada');
      error.statusCode = 404;
      throw error;
    }
    return RatingDTO.toResponse(updated);
  }

  async deleteRating(ratingId, userId) {
  const deleted = await ratingRepository.delete(ratingId, userId);

  if (!deleted) {
    const error = new Error('Reseña no encontrada o no autorizada');
    error.statusCode = 404;
    throw error;
  }

  // Recalcular el promedio del vino después de eliminar la reseña.
  if (wineRepository.updateAverageRating) {
    await wineRepository.updateAverageRating(deleted.wine);
  }

  return { message: 'Reseña eliminada exitosamente' };
}

  

  async toggleLikeRating(ratingId, userId) {
    const rating = await ratingRepository.findById(ratingId);

    if (!rating) {
      const error = new Error('Reseña no encontrada');
      error.statusCode = 404;
      throw error;
    }

    const hasLiked = rating.likes.some(
      (like) => like.toString() === userId.toString()
    );

    const updatedRating = await ratingRepository.toggleLike(
      ratingId,
      userId,
      hasLiked
    );

    return {
      message: hasLiked
        ? 'Like eliminado correctamente'
        : 'Like agregado correctamente',
      rating: RatingDTO.toResponse(updatedRating)
    };
  }


}

module.exports = new RatingService();