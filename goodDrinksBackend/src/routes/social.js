const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social');
const verifyToken = require('../middlewares/verifyToken');
const validate = require('../middlewares/validate');
const { followParamSchema } = require('../validationSchemas/social');

router.use(verifyToken);

router.post('/follow/:id', validate(followParamSchema, 'params'), socialController.followUser);
router.post('/unfollow/:id', validate(followParamSchema, 'params'), socialController.unfollowUser);
router.get('/feed', socialController.getFeed);

module.exports = router;