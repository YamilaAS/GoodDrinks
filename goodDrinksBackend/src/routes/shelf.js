const express = require('express');
const router = express.Router();
const shelfController = require('../controllers/shelf');
const verifyToken = require('../middlewares/verifyToken');

// Todas las rutas requieren token obligatorio
router.use(verifyToken);

router.post('/', shelfController.addOrUpdateWineInShelf); // Agregar o cambiar estantería
router.get('/me', shelfController.getMyShelves);          // Ver mis estanterías organizadas
router.delete('/:wineId', shelfController.removeWineFromShelf); // Quitar vino de la estantería

module.exports = router;