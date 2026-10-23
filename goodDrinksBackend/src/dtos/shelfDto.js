
const WineDTO = require('./wineDto');

class ShelfDTO {
  static toResponse(shelf) {
    if (!shelf) return null;

    // Convertimos el documento de MongoDB en un objeto normal.
    const raw =
      typeof shelf.toObject === 'function'
        ? shelf.toObject()
        : shelf;

    // Obtenemos el ID de la estantería.
    const id = (raw._id || raw.id)?.toString();

    // Convertimos la lista de vinos, si existe.
    const wines = Array.isArray(raw.wines)
      ? raw.wines.map(w =>
          typeof w === 'object' && w && (w._id || w.id)
            ? WineDTO.toResponse(w)
            : w
        )
      : [];

    // Devolvemos los datos de la estantería.
    return {
      _id: id,
      id,
      name: raw.name,
      status: raw.status,

      // IMPORTANTE: incluimos el vino asociado a esta estantería.
      // Si MongoDB lo pobló, devolvemos sus datos transformados.
      // Si no, devolvemos el ID que tengamos disponible.
      wine:
        raw.wine && typeof raw.wine === 'object'
          ? WineDTO.toResponse(raw.wine)
          : raw.wine,

      user:
        raw.user && typeof raw.user === 'object' &&
        (raw.user._id || raw.user.id)
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
