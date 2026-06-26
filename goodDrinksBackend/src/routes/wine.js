const express = require('express');
const router = express.Router();
const WineController = require('../controllers/wine');
const authenticate = require('../middlewares/auth');

router.post('/', authenticate, WineController.createWine);
router.get('/', WineController.getAllWines);
router.get('/:id', WineController.getWineById);
router.put('/:id', authenticate, WineController.updateWine);
router.delete('/:id', authenticate, WineController.deleteWine);

module.exports = router;
