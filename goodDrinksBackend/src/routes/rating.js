const express = require('express');
const ratingController = require('../controllers/rating');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken'); // ¡Corregido!

// Ruta Pública (Cualquiera puede ver los comentarios de un vino)
router.get('/wine/:wineId', ratingController.getRatingsByWine); 

// Rutas Privadas (Requieren inicio de sesión)
router.post('/', verifyToken, ratingController.createRating);
router.put('/:id', verifyToken, ratingController.updateRating); // Pasó a tener /:id
router.delete('/:id', verifyToken, ratingController.deleteRating); // Pasó a tener /:id

module.exports = router;