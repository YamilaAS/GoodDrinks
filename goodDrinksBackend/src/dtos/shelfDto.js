const WineDTO = require('./wineDto');

class ShelfDTO {
  static toResponse(shelf) {
    if (!shelf) return null;
    const raw = typeof shelf.toObject === 'function' ? shelf.toObject() : shelf;
    const id = (raw._id || raw.id)?.toString();

    const wines = Array.isArray(raw.wines)
      ? raw.wines.map(w => (typeof w === 'object' && (w._id || w.id) ? WineDTO.toResponse(w) : w))
      : [];

    return {
      _id: id,
      id,
      name: raw.name,
      status: raw.status,
      user: raw.user && typeof raw.user === 'object' && (raw.user._id || raw.user.id) 
        ? (raw.user._id || raw.user.id).toString() 
        : raw.user,
      wines,
      isPublic: raw.isPublic ?? true,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    };
  }

  static toResponseList(shelves) {
    if (!Array.isArray(shelves)) return [];
    return shelves.map(shelf => this.toResponse(shelf));
  }
}

module.exports = ShelfDTO;