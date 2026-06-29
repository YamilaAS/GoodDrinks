const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Ya NO encriptamos aquí. El modelo user.js (pre-save) lo hace solo.
        const newUser = new User({ username, email, password });
        await newUser.save();

        // Convertimos a objeto y removemos la contraseña de la respuesta por seguridad
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (err) {
        if (err.code === 11000) { // Error de Mongoose para campos duplicados (unique)
            return res.status(400).json({ error: 'El usuario o el correo ya están registrados' });
        }
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
};

// Iniciar sesión (login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscamos al usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' }); // Mensaje genérico por seguridad
        }

        // Usamos el método que creamos en el modelo para comparar contraseñas
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Crear token JWT (Usa 'id' para ser consistente con req.user.id en verifyToken)
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.TOKEN_API_VINOS,
            { expiresIn: '4h' }
        );

        res.status(200).json({ 
            token, 
            user: { id: user._id, username: user.username, email: user.email } 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

// Obtener datos del usuario autenticado
exports.getMe = async (req, res) => {
    try {
        // req.user.id viene de lo que decodificó verifyToken.js
        // .select('-password') excluye la contraseña del resultado
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
    try {
        // Nota: Si se va a actualizar la contraseña desde aquí, se debe pasar por el método save() 
        // para que se dispare el pre-save. Por ahora asumimos actualización de datos básicos.
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};