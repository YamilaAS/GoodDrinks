const Wine = require('../models/wine');

class WineRepository {
  async create(wineData) {
    const wine = new Wine(wineData);
    return await wine.save();
  }

  async findAll(query = {}) {
    const { type, winery, search } = query;
    let filters = {};

    if (type) filters.type = type;
    if (winery) filters.winery = winery;

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { winery: { $regex: search, $options: 'i' } },
        { variety: { $regex: search, $options: 'i' } }
      ];
    }

    return await Wine.find(filters).sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Wine.findById(id);
  }

  async update(id, updateData) {
    return await Wine.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await Wine.findByIdAndDelete(id);
  }
}

module.exports = new WineRepository();