const Rating = require('../models/rating');

class RatingRepository {
  async create(ratingData) {
    const rating = new Rating(ratingData);
    return await rating.save();
  }

  async findByUserAndWine(userId, wineId) {
    return await Rating.findOne({ user: userId, wine: wineId });
  }

  async findByWineId(wineId) {
    return await Rating.find({ wine: wineId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
  }

  async findByIdAndUser(ratingId, userId) {
    return await Rating.findOne({ _id: ratingId, user: userId });
  }

  async findById(ratingId) {
    return await Rating.findById(ratingId);
  }

  async deleteByIdAndUser(ratingId, userId) {
    return await Rating.findOneAndDelete({ _id: ratingId, user: userId });
  }

  async toggleLike(ratingId, userId, hasLiked) {
    const update = hasLiked 
      ? { $pull: { likes: userId } } 
      : { $addToSet: { likes: userId } };

    return await Rating.findByIdAndUpdate(ratingId, update, { new: true });
  }
}

module.exports = new RatingRepository();