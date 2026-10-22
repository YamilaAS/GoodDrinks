const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: [true, 'El usuario es obligatorio'] 
    },
    wine: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Wine',
        required: [true, 'El vino es obligatorio'] 
    },
    rating: { 
        type: Number, 
        required: [true, 'La puntuación es obligatoria'], 
        min: [1, 'La puntuación mínima es 1'], 
        max: [5, 'La puntuación máxima es 5'] 
    },
    comments: { 
        type: String, 
        trim: true,
        maxlength: [500, 'El comentario no puede superar los 500 caracteres'] 
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
}); 

// Evitar que un mismo usuario califique el mismo vino más de una vez
RatingSchema.index({ wine: 1, user: 1 }, { unique: true });

// --- Calcular Promedio de Calificaciones ---
RatingSchema.statics.calculateAverageRating = async function(wineId) {
    const stats = await this.aggregate([
        { $match: { wine: wineId } },
        {
            $group: {
                _id: '$wine',
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        if (stats.length > 0) {
            await mongoose.model('Wine').findByIdAndUpdate(wineId, {
                averageRating: Math.round(stats[0].avgRating * 10) / 10
            });
        } else {
            await mongoose.model('Wine').findByIdAndUpdate(wineId, {
                averageRating: 0
            });
        }
    } catch (error) {
        console.error('Error actualizando el promedio del vino:', error);
    }
};

// Disparar el cálculo después de guardar una nueva calificación
RatingSchema.post('save', function() {
    this.constructor.calculateAverageRating(this.wine);
});

// Disparar el cálculo después de eliminar una calificación
RatingSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await doc.constructor.calculateAverageRating(doc.wine);
    }
});

module.exports = mongoose.models.Rating || mongoose.model('Rating', RatingSchema);