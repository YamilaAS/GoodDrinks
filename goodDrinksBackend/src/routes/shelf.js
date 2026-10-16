const express = require('express');
const router = express.Router();
const shelfController = require('../controllers/shelf');
const validate = require('../middlewares/validate');
const verifyToken = require('../middlewares/verifyToken');
const { addOrUpdateShelfSchema } = require('../validationSchemas/shelf');

router.use(verifyToken);

router.post('/', validate(addOrUpdateShelfSchema), shelfController.addOrUpdateWineInShelf);
router.get('/me', shelfController.getMyShelves);
router.delete('/:wineId', shelfController.removeWineFromShelf);

module.exports = router;