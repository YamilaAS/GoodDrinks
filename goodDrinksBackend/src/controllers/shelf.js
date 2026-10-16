const shelfService = require('../services/shelfService');

exports.addOrUpdateWineInShelf = async (req, res, next) => {
  try {
    const { wineId, status } = req.body;
    const result = await shelfService.addOrUpdateWineInShelf(req.user.id, wineId, status);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getMyShelves = async (req, res, next) => {
  try {
    const organizedShelves = await shelfService.getMyShelves(req.user.id);
    res.status(200).json(organizedShelves);
  } catch (err) {
    next(err);
  }
};

exports.removeWineFromShelf = async (req, res, next) => {
  try {
    const result = await shelfService.removeWineFromShelf(req.user.id, req.params.wineId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};