const express = require('express');
const ratingController = require('../controllers/rating');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken'); 

// Ruta Pública (Cualquiera puede ver los comentarios de un vino)
router.get('/wine/:wineId', ratingController.getRatingsByWine); 

// Rutas Privadas (Requieren inicio de sesión)
router.post('/', verifyToken, ratingController.createRating);
router.put('/:id', verifyToken, ratingController.updateRating); 
router.delete('/:id', verifyToken, ratingController.deleteRating); 
router.post('/:id/like', verifyToken, ratingController.toggleLikeRating);

module.exports = router;