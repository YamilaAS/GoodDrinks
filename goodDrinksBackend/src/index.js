const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(bodyParser.json());
app.use(cors());


// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Error connecting to MongoDB:', err));


// Rutas
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de Vinos');
});

const wineRoutes = require('./routes/wine');
const userRoutes = require('./routes/user');
const ratingRoutes = require('./routes/rating');


app.use('/api/wines', wineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ratings', ratingRoutes);



// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});




