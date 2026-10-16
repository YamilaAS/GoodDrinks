const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// --- Middlewares Globales ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Conexión a MongoDB ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🚀 Conexión exitosa a MongoDB'))
  .catch(err => {
    console.error('❌ Error crítico al conectar a MongoDB:', err.message);
    process.exit(1);
  });

// --- Importación de Rutas ---
const wineRoutes = require('./routes/wine');
const userRoutes = require('./routes/user');
const ratingRoutes = require('./routes/rating');
const shelfRoutes = require('./routes/shelf'); 
const socialRoutes = require('./routes/social');

// --- Definición de Endpoints ---
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Bienvenido a la API de GoodDrinks' });
});

app.use('/api/wines', wineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/shelves', shelfRoutes);
app.use('/api/social', socialRoutes);

// --- Manejo de Rutas No Encontradas (404) ---
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// --- Middleware Centralizado de Errores (4 Argumentos) ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: errorMessage
  });
});

// --- Iniciar el Servidor ---
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`📡 Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;