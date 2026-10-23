
const favoriteRepository = require('../repositories/favoriteRepository');
const mongoose = require('mongoose');

class FavoriteService {
  async addFavorite(userId, wineId) {
    // Validar que el ID del vino tenga un formato válido.
    if (!mongoose.Types.ObjectId.isValid(wineId)) {
      const error = new Error('El ID del vino no es válido');
      error.statusCode = 400;
      throw error;
    }

    const favorite = await favoriteRepository.add(userId, wineId);

    return {
      message: 'Vino agregado a tus favoritos',
      data: favorite
    };
  }

  async getMyFavorites(userId) {
    const favorites = await favoriteRepository.findByUserId(userId);

    return favorites;
  }

  async removeFavorite(userId, wineId) {
    if (!mongoose.Types.ObjectId.isValid(wineId)) {
      const error = new Error('El ID del vino no es válido');
      error.statusCode = 400;
      throw error;
    }

    await favoriteRepository.deleteByUserAndWine(userId, wineId);

    return {
      message: 'Vino eliminado de tus favoritos'
    };
  }
}

module.exports = new FavoriteService();
