const Shelf = require('../models/shelf');

class ShelfRepository {
  async upsert(userId, wineId, status) {
    return await Shelf.findOneAndUpdate(
      { user: userId, wine: wineId },
      { status },
      { new: true, upsert: true, runValidators: true }
    );
  }

  async findByUserId(userId) {
    return await Shelf.find({ user: userId })
      .populate('wine')
      .sort({ updatedAt: -1 });
  }

  async deleteByUserAndWine(userId, wineId) {
    return await Shelf.findOneAndDelete({ user: userId, wine: wineId });
  }
}

module.exports = new ShelfRepository();