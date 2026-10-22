const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'El nombre de usuario es obligatorio'], 
        unique: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'El correo electrónico es obligatorio'], 
        unique: true,
        trim: true,
        lowercase: true, 
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, ingresa un correo válido']
    },
    password: { 
        type: String, 
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true // Crea automáticamente los campos createdAt y updatedAt 
});

// Middleware de Mongoose: Encriptar contraseña antes de guardar el usuario
userSchema.pre('save', async function(next) {
    // Solo encripta la contraseña si ha sido modificada (o es nueva)
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas en el login
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;