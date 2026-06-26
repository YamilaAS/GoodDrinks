const Wine = require('../models/wine');

// Crear un nuevo vino
exports.createWine = async (req, res) => {
  try {
    const wine = new Wine(req.body);
    await wine.save();
    res.status(201).json(wine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Obtener todos los vinos
exports.getAllWines = async (req, res) => {
  try {
    const wines = await Wine.find();
    res.json(wines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener un vino por ID
exports.getWineById = async (req, res) => {
  try {
    const wine = await Wine.findById(req.params.id);
    if (!wine) return res.status(404).json({ message: 'Vino no encontrado' });
    res.json(wine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Actualizar un vino
exports.updateWine = async (req, res) => {
  try {
    const wine = await Wine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!wine) return res.status(404).json({ message: 'Vino no encontrado' });
    res.json(wine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Eliminar un vino
exports.deleteWine = async (req, res) => {
  try {
    const wine = await Wine.findByIdAndDelete(req.params.id);
    if (!wine) return res.status(404).json({ message: 'Vino no encontrado' });
    res.json({ message: 'Vino eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
