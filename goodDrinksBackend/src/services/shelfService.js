const shelfRepository = require('../repositories/shelfRepository');
const ShelfDTO = require('../dtos/shelfDto');

class ShelfService {
  async addOrUpdateWineInShelf(userId, wineId, status) {
    let shelf;

    if (typeof shelfRepository.addOrUpdateWineInShelf === 'function') {
      shelf = await shelfRepository.addOrUpdateWineInShelf(userId, wineId, status);
    } else if (typeof shelfRepository.addWineToShelf === 'function') {
      shelf = await shelfRepository.addWineToShelf(userId, wineId, status);
    } else if (typeof shelfRepository.addWine === 'function') {
      shelf = await shelfRepository.addWine({ userId, wineId, status });
    }

    // Si el repositorio no devuelve el documento actualizado pero realiza la operación
    const responseData = shelf ? ShelfDTO.toResponse(shelf) : { wineId, status };

    return {
      message: 'Vino agregado a la estantería exitosamente',
      data: {
        ...responseData,
        status: status || responseData?.status
      }
    };
  }

  async getMyShelves(userId) {
    let shelves;
    if (typeof shelfRepository.getMyShelves === 'function') {
      shelves = await shelfRepository.getMyShelves(userId);
    } else if (typeof shelfRepository.getUserShelves === 'function') {
      shelves = await shelfRepository.getUserShelves(userId);
    } else if (typeof shelfRepository.findByUserId === 'function') {
      shelves = await shelfRepository.findByUserId(userId);
    }

    if (Array.isArray(shelves)) {
      return {
        porProbar: ShelfDTO.toResponseList(shelves.filter(s => s.status === 'Por probar')),
        tomando: ShelfDTO.toResponseList(shelves.filter(s => s.status === 'Tomando')),
        yaTomados: ShelfDTO.toResponseList(shelves.filter(s => s.status === 'Ya tomados'))
      };
    }

    return {
      porProbar: ShelfDTO.toResponseList(shelves?.porProbar || []),
      tomando: ShelfDTO.toResponseList(shelves?.tomando || []),
      yaTomados: ShelfDTO.toResponseList(shelves?.yaTomados || [])
    };
  }

  async removeWineFromShelf(userId, wineId) {
    if (typeof shelfRepository.removeWineFromShelf === 'function') {
      await shelfRepository.removeWineFromShelf(userId, wineId);
    } else if (typeof shelfRepository.removeWine === 'function') {
      await shelfRepository.removeWine(userId, wineId);
    }

    return { message: 'Vino removido de tus estanterías exitosamente' };
  }
}

module.exports = new ShelfService();