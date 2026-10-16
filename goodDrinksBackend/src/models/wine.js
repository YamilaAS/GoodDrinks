// src/models/wine.js
const mongoose = require('mongoose');

const wineSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'El nombre del vino es obligatorio'], trim: true },
  type: { type: String, required: [true, 'El tipo (tinto, blanco, etc.) es obligatorio'] },
  winery: { type: String, required: [true, 'La bodega es obligatoria'], trim: true },
  year: { 
    type: Number, 
    required: [true, 'El año es obligatorio'],
    min: [1000, 'Año inválido'],
    max: [new Date().getFullYear(), 'El año no puede ser en el futuro'] 
  },
  region: { type: String, required: [true, 'La región es obligatoria'] },
  variety: { type: String, required: [true, 'La variedad de uva es obligatoria'] },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  imageUrl: { type: String, required: [true, 'La URL de la imagen es obligatoria'] }
}, {
  timestamps: true
});

const Wine = mongoose.model('Wine', wineSchema);

module.exports = Wine;