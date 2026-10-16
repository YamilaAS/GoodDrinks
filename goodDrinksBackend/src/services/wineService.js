const wineRepository = require('../repositories/wineRepository');
const WineDTO = require('../dtos/wineDto');

class WineService {
  async createWine(wineData) {
    const newWine = await wineRepository.create(wineData);
    return WineDTO.toResponse(newWine);
  }

  async getWineById(id) {
    const wine = await wineRepository.findById(id);
    if (!wine) {
      const error = new Error('Vino no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return WineDTO.toResponse(wine);
  }

  async getAllWines(filters) {
    const wines = await wineRepository.findAll(filters);
    return WineDTO.toResponseList(wines);
  }

  async updateWine(id, updateData) {
    const updatedWine = await wineRepository.update(id, updateData);
    if (!updatedWine) {
      const error = new Error('Vino no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return WineDTO.toResponse(updatedWine);
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