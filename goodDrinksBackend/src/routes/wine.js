const express = require('express');
const router = express.Router();
const wineController = require('../controllers/wine');
const validate = require('../middlewares/validate');
const verifyToken = require('../middlewares/verifyToken');
const { createWineSchema, updateWineSchema } = require('../validationSchemas/wine');

// Rutas Públicas
router.get('/', wineController.getAllWines);
router.get('/:id', wineController.getWineById);

// Rutas Protegidas
router.post('/', verifyToken, validate(createWineSchema), wineController.createWine);
router.put('/:id', verifyToken, validate(updateWineSchema), wineController.updateWine);
router.delete('/:id', verifyToken, wineController.deleteWine);

module.exports = router;