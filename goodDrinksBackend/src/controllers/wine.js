const wineService = require('../services/wineService');
const Wine = require('../models/wine');

exports.createWine = async (req, res, next) => {
  try {
    const wine = await wineService.createWine(req.body);
    res.status(201).json(wine);
  } catch (err) {
    next(err);
  }
};

exports.getAllWines = async (req, res, next) => {
  try {
    const wines = await wineService.getAllWines(req.query);
    res.status(200).json(wines);
  } catch (err) {
    next(err);
  }
};

exports.getWineById = async (req, res, next) => {
  try {
    const wine = await wineService.getWineById(req.params.id);
    res.status(200).json(wine);
  } catch (err) {
    next(err);
  }
};

exports.updateWine = async (req, res, next) => {
  try {
    const wine = await wineService.updateWine(req.params.id, req.body);
    res.status(200).json(wine);
  } catch (err) {
    next(err);
  }
};

exports.deleteWine = async (req, res, next) => {
  try {
    const result = await wineService.deleteWine(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};