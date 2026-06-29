const mongoose = require('mongoose');

const shelfSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    wine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wine',
        required: true
    },
    status: {
        type: String,
        enum: ['Por probar', 'Tomando', 'Ya tomados'],
        required: true,
        default: 'Por probar'
    }
}, { 
    timestamps: true 
});

// Índice compuesto: Un usuario no puede tener el mismo vino dos veces en sus estanterías.
// Si quiere cambiar de estado (de 'Por probar' a 'Ya tomados'), se actualiza el documento existente.
shelfSchema.index({ user: 1, wine: 1 }, { unique: true });

const Shelf = mongoose.model('Shelf', shelfSchema);
module.exports = Shelf;