const UserDTO = require('./userDto');
const WineDTO = require('./wineDto');

class RatingDTO {
  static toResponse(rating) {
    if (!rating) return null;
    const raw = typeof rating.toObject === 'function' ? rating.toObject() : rating;
    const id = (raw._id || raw.id)?.toString();

    const user = raw.user && typeof raw.user === 'object' && (raw.user._id || raw.user.id)
      ? UserDTO.toResponse(raw.user)
      : raw.user;

    const wine = raw.wine && typeof raw.wine === 'object' && (raw.wine._id || raw.wine.id)
      ? WineDTO.toResponse(raw.wine)
      : raw.wine;

    return {
      _id: id,
      id,
      rating: raw.rating ?? raw.score,
      score: raw.score ?? raw.rating,
      comment: raw.comment,
      likes: raw.likes || [],
      user,
      wine,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    };
  }

  static toResponseList(ratings) {
    if (!Array.isArray(ratings)) return [];
    return ratings.map(rating => this.toResponse(rating));
  }
}

module.exports = RatingDTO;