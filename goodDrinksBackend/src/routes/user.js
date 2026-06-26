const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validationSchemas/user');
const verifyToken = require('../middlewares/verifyToken');



router.post('/register', validate(registerSchema), userController.createUser);
router.post('/login', validate(loginSchema), userController.login);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validate(registerSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/me', verifyToken, userController.getMe);




module.exports = router;



