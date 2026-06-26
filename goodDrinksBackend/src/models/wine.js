const mongoose = require('mongoose');

const wineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  winery: { type: String, required: true },
  year: { type: Number, required: true },
  region: { type: String, required: true },
  variety: { type: String, required: true },
  averageRating: { type: Number, default: 0 },
  imageUrl: { type: String, required: true }
});

const Wine = mongoose.model('Wine', wineSchema);
module.exports = Wine;
