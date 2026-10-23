const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating');
const validate = require('../middlewares/validate');
const verifyToken = require('../middlewares/verifyToken');
const { createRatingSchema, updateRatingSchema } = require('../validationSchemas/rating');

// Ruta Pública
router.get('/wine/:wineId', ratingController.getRatingsByWine);
router.post('/batch', ratingController.getRatingsByWineIds);


// Rutas Protegidas
router.post('/', verifyToken, validate(createRatingSchema), ratingController.createRating);
router.put('/:id', verifyToken, validate(updateRatingSchema), ratingController.updateRating);
router.delete('/:id', verifyToken, ratingController.deleteRating);
router.post('/:id/like', verifyToken, ratingController.toggleLikeRating);

module.exports = router;