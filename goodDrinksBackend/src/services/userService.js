const userRepository = require('../repositories/userRepository');
const jwt = require('jsonwebtoken');

class UserService {
  async registerUser({ username, email, password }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('El correo electrónico ya está registrado');
      error.statusCode = 400;
      throw error;
    }

    const newUser = await userRepository.create({ username, email, password });
    const userObject = newUser.toObject();
    delete userObject.password;
    
    return userObject;
  }

  async loginUser({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Fallback asegurado para Jest/Testing
    const secret = process.env.JWT_SECRET || process.env.TOKEN_API_VINOS || 'dev_jwt_secret_key_123';
    
    const token = jwt.sign(
      { id: user._id, username: user.username },
      secret,
      { expiresIn: '4h' }
    );

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    };
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async getAllUsers() {
    return await userRepository.findAll();
  }

  async updateUser(id, updateData) {
    const updatedUser = await userRepository.update(id, updateData);
    if (!updatedUser) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    
    const userObject = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
    delete userObject.password;
    return userObject;
  }

  async deleteUser(id) {
    const deleted = await userRepository.delete(id);
    if (!deleted) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Usuario eliminado exitosamente' };
  }
}

module.exports = new UserService();