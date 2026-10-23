
const express = require('express');
const router = express.Router();

const favoriteController = require('../controllers/favorite');
const verifyToken = require('../middlewares/verifyToken');

// Todas las rutas requieren autenticación.
router.use(verifyToken);

// Obtener los favoritos del usuario autenticado.
router.get('/me', favoriteController.getMyFavorites);

// Agregar un vino a favoritos.
router.post('/:wineId', favoriteController.addFavorite);

// Quitar un vino de favoritos.
router.delete('/:wineId', favoriteController.removeFavorite);

module.exports = router;
