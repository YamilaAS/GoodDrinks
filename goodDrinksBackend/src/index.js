const express = require('express');
const mongoose = require('mongoose'); // Eliminamos bodyParser porque Express ya lo trae nativo
const dotenv = require('dotenv');
const cors = require('cors');

// Cargar variables de entorno antes de cualquier otra cosa
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// --- Middlewares Globales ---
app.use(cors());
app.use(express.json()); // Reemplazo de bodyParser.json()
app.use(express.urlencoded({ extended: true })); // Para soportar datos de formularios si hace falta

// --- Conexión a MongoDB ---
// Mongoose ya maneja internamente las opciones antiguas (useNewUrlParser, etc.) en versiones recientes.
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🚀 Conexión exitosa a MongoDB'))
  .catch(err => {
    console.error('❌ Error crítico al conectar a MongoDB:', err.message);
    process.exit(1); // Detiene la app si no se puede conectar a la BD
  });

// --- Importación de Rutas ---
const wineRoutes = require('./routes/wine');
const userRoutes = require('./routes/user');
const ratingRoutes = require('./routes/rating');

// --- Definición de Endpoints ---
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Bienvenido a la API de GoodDrinks' });
});

app.use('/api/wines', wineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ratings', ratingRoutes);

// --- Manejo de Rutas No Encontradas (404) ---
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`📡 Servidor corriendo en http://localhost:${PORT}`);
});