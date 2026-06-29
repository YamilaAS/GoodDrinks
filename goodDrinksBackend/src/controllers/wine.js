const Wine = require('../models/wine');

// Crear un nuevo vino
exports.createWine = async (req, res) => {
  try {
    // Desestructuramos para ignorar por completo si nos mandan un averageRating falso
    const { name, type, winery, year, region, variety, imageUrl } = req.body;

    const wine = new Wine({
      name, type, winery, year, region, variety, imageUrl,
      averageRating: 0 // Forzamos que empiece en 0 de forma segura
    });

    await wine.save();
    res.status(201).json(wine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener todos los vinos (Con opción de filtrado opcional)
exports.getAllWines = async (req, res) => {
  try {
    const filters = {};
    
    // Si mandan filtros por la URL (ej: /api/wines?type=Tinto), los aplicamos de forma limpia
    if (req.query.type) filters.type = req.query.type;
    if (req.query.winery) filters.winery = req.query.winery;

    const wines = await Wine.find(filters);
    res.status(200).json(wines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un vino por ID
exports.getWineById = async (req, res) => {
  try {
    const wine = await Wine.findById(req.params.id);
    if (!wine) return res.status(404).json({ error: 'Vino no encontrado' });
    res.status(200).json(wine);
  } catch (err) {
    res.status(500).json({ error: 'ID de vino inválido o error de servidor' });
  }
};

// Actualizar un vino
exports.updateWine = async (req, res) => {
  try {
    // Clonamos el body y borramos averageRating por seguridad para que no lo puedan alterar por payload
    const updateData = { ...req.body };
    delete updateData.averageRating;

    const wine = await Wine.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!wine) return res.status(404).json({ error: 'Vino no encontrado' });
    
    res.status(200).json(wine);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar un vino
exports.deleteWine = async (req, res) => {
  try {
    const wine = await Wine.findByIdAndDelete(req.params.id);
    if (!wine) return res.status(404).json({ error: 'Vino no encontrado' });
    
    res.status(200).json({ message: 'Vino eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};