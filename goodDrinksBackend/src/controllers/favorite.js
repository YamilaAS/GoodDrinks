
const favoriteService = require('../services/favoriteService');

exports.addFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.addFavorite(
      req.user.id,
      req.params.wineId
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getMyFavorites = async (req, res, next) => {
  try {
    const result = await favoriteService.getMyFavorites(req.user.id);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.removeFavorite(
      req.user.id,
      req.params.wineId
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
