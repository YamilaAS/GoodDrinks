const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




// Crear un nuevo usuario
exports.createUser = async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10); // 10 es el número de saltos

      const newUser = new User({
          username,
          email,
          password: hashedPassword
      });

      await newUser.save();
      res.status(201).json(newUser);
  } catch (err) {
      console.error('Error al crear el usuario:', err);
      res.status(500).json({ message: 'Error al crear el usuario', error: err });
  }
};

// Obtener todos los usuario
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//iniciar sesión (login)
exports.login = async (req, res) => {
  try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      console.log(email,password);

      const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        console.log(user);

        // Crear un token JWT
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.TOKEN_API_VINOS,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });
  } catch (err) {
      console.error('Error al iniciar sesión:', err);
      res.status(500).json({ message: 'Error al iniciar sesión', error: err });
  }
};

// Nueva ruta para obtener los datos del usuario autenticado
exports.getMe = async (req, res) => {
  try {
    console.log('User ID:', req.user._id); 
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    console.error('Database error:', err); 
    res.status(500).json({ message: err.message });
  }
};

