const shelfRepository = require('../repositories/shelfRepository');

class ShelfService {
  async addOrUpdateWineInShelf(userId, wineId, status) {
    const shelfItem = await shelfRepository.upsert(userId, wineId, status);
    return {
      message: `Vino organizado con éxito en la estantería: ${status}`,
      data: shelfItem
    };
  }

  async getMyShelves(userId) {
    const shelves = await shelfRepository.findByUserId(userId);

    return {
      porProbar: shelves.filter(item => item.status === 'Por probar').map(item => item.wine),
      tomando: shelves.filter(item => item.status === 'Tomando').map(item => item.wine),
      yaTomados: shelves.filter(item => item.status === 'Ya tomados').map(item => item.wine)
    };
  }

  async removeWineFromShelf(userId, wineId) {
    const deletedItem = await shelfRepository.deleteByUserAndWine(userId, wineId);
    if (!deletedItem) {
      const error = new Error('El vino no se encontraba en ninguna estantería');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Vino removido de tus estanterías exitosamente' };
  }
}

module.exports = new ShelfService();