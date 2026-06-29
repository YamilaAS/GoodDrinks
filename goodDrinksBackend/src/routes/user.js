const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validationSchemas/user');
const verifyToken = require('../middlewares/verifyToken');

// Rutas Públicas
router.post('/register', validate(registerSchema), userController.createUser);
router.post('/login', validate(loginSchema), userController.login);

// Rutas Privadas (Protegidas por Token)
router.get('/me', verifyToken, userController.getMe); // Movido arriba
router.get('/', verifyToken, userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.put('/:id', verifyToken, validate(registerSchema), userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);

module.exports = router;