const express = require('express');
const router = express.Router();
const WineController = require('../controllers/wine');
const verifyToken = require('../middlewares/verifyToken'); // ¡Corregido aquí!

// Rutas Públicas (Cualquiera puede ver los vinos)
router.get('/', WineController.getAllWines);
router.get('/:id', WineController.getWineById);

// Rutas Privadas (Solo usuarios autenticados pueden alterar el catálogo)
router.post('/', verifyToken, WineController.createWine);
router.put('/:id', verifyToken, WineController.updateWine);
router.delete('/:id', verifyToken, WineController.deleteWine);

module.exports = router;