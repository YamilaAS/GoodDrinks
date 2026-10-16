const wineRepository = require('../repositories/wineRepository');

class WineService {
  async createWine(wineData) {
    const { name, type, winery, year, region, variety, imageUrl } = wineData;

    // Forzamos que averageRating sea 0 en la creación
    const safeWineData = {
      name,
      type,
      winery,
      year,
      region,
      variety,
      imageUrl,
      averageRating: 0
    };

    return await wineRepository.create(safeWineData);
  }

  async getAllWines(query) {
    return await wineRepository.findAll(query);
  }

  async getWineById(id) {
    const wine = await wineRepository.findById(id);
    if (!wine) {
      const error = new Error('Vino no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return wine;
  }

  async updateWine(id, updateData) {
    // Evitamos la modificación manual del averageRating
    const cleanData = { ...updateData };
    delete cleanData.averageRating;

    const updatedWine = await wineRepository.update(id, cleanData);
    if (!updatedWine) {
      const error = new Error('Vino no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return updatedWine;
  }

  async deleteWine(id) {
    const deleted = await wineRepository.delete(id);
    if (!deleted) {
      const error = new Error('Vino no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Vino eliminado exitosamente' };
  }
}

module.exports = new WineService();