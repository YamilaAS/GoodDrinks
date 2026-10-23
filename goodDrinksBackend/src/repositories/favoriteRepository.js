
const Favorite = require('../models/favorite');

class FavoriteRepository {
  // Guardar un vino como favorito.
  async add(userId, wineId) {
    return await Favorite.findOneAndUpdate(
      { user: userId, wine: wineId },
      { $setOnInsert: { user: userId, wine: wineId } },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );
  }

  // Obtener todos los favoritos de un usuario.
  async findByUserId(userId) {
    return await Favorite.find({ user: userId })
      .populate('wine')
      .sort({ createdAt: -1 });
  }

  // Quitar un vino de los favoritos de un usuario.
  async deleteByUserAndWine(userId, wineId) {
    return await Favorite.findOneAndDelete({
      user: userId,
      wine: wineId
    });
  }
}

module.exports = new FavoriteRepository();
