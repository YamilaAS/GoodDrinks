const express = require('express');
const ratingController = require('../controllers/rating');
const router = express.Router();
const authenticate = require('../middlewares/auth');

router.post('/', authenticate, ratingController.createRating);
router.get('/wine/:wineId', ratingController.getRatingsByWine); 
router.put('/', authenticate, ratingController.updateRating);
router.delete('/', authenticate, ratingController.deleteRating); 

module.exports = router;