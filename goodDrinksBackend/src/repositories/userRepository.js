const User = require('../models/user');

class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findById(id) {
    return await User.findById(id).select('-password');
  }

  async findByIdWithPassword(id) {
    return await User.findById(id);
  }

  async findAll() {
    return await User.find().select('-password');
  }

  async update(id, updateData) {
    // Si incluye contraseña, usamos findById + save para ejecutar hooks pre-save
    if (updateData.password) {
      const user = await User.findById(id);
      if (!user) return null;
      Object.assign(user, updateData);
      return await user.save();
    }
    
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }
}

module.exports = new UserRepository();
