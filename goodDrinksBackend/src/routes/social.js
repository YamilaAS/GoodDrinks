const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social');
const verifyToken = require('../middlewares/verifyToken');

// Protegemos todas las rutas sociales con Token
router.use(verifyToken);

router.post('/follow/:id', socialController.followUser);     // Seguir usuario
router.post('/unfollow/:id', socialController.unfollowUser); // Dejar de seguir
router.get('/feed', socialController.getFeed);               // Ver el muro estilo Goodreads

module.exports = router;