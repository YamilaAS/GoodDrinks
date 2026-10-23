
const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    wine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wine',
        required: true
    }
}, {
    timestamps: true
});

// Un usuario no puede marcar el mismo vino como favorito dos veces.
favoriteSchema.index({ user: 1, wine: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
