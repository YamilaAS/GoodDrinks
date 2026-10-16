const ratingService = require('../services/ratingService');

exports.createRating = async (req, res, next) => {
  try {
    const newRating = await ratingService.createRating(req.user.id, req.body);
    res.status(201).json(newRating);
  } catch (err) {
    next(err);
  }
};

exports.getRatingsByWine = async (req, res, next) => {
  try {
    const ratings = await ratingService.getRatingsByWine(req.params.wineId);
    res.status(200).json(ratings);
  } catch (err) {
    next(err);
  }
};

exports.updateRating = async (req, res, next) => {
  try {
    const updatedRating = await ratingService.updateRating(req.params.id, req.user.id, req.body);
    res.status(200).json(updatedRating);
  } catch (err) {
    next(err);
  }
};

exports.deleteRating = async (req, res, next) => {
  try {
    const result = await ratingService.deleteRating(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.toggleLikeRating = async (req, res, next) => {
  try {
    const result = await ratingService.toggleLikeRating(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};