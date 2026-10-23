
const ShelfDTO = require('../dtos/shelfDto');
const shelfRepository = require('../repositories/shelfRepository');

class ShelfService {
  // Agrega un vino a la cava o actualiza su estado.
  async addOrUpdateWineInShelf(userId, wineId, status) {
    // Usamos el nombre real del método del repositorio.
    const shelf = await shelfRepository.upsert(
      userId,
      wineId,
      status
    );

    return {
      message: 'Vino agregado a la estantería exitosamente',
      data: ShelfDTO.toResponse(shelf)
    };
  }

  // Obtiene todas las estanterías del usuario.
  async getMyShelves(userId) {
    // Este método sí existe en tu repositorio.
    const shelves = await shelfRepository.findByUserId(userId);

    // Separamos los vinos según su estado.
    return {
      porProbar: ShelfDTO.toResponseList(
        shelves.filter(shelf => shelf.status === 'Por probar')
      ),

      tomando: ShelfDTO.toResponseList(
        shelves.filter(shelf => shelf.status === 'Tomando')
      ),

      yaTomados: ShelfDTO.toResponseList(
        shelves.filter(shelf => shelf.status === 'Ya tomados')
      )
    };
  }

  // Quita un vino de la cava del usuario.
  async removeWineFromShelf(userId, wineId) {
    // Usamos el nombre real del método del repositorio.
    await shelfRepository.deleteByUserAndWine(userId, wineId);

    return {
      message: 'Vino removido de tus estanterías exitosamente'
    };
  }
}

module.exports = new ShelfService();
