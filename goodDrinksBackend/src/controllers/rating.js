const Rating = require('../models/rating');
const Wine = require('../models/wine');

// Crear una nueva calificación
exports.createRating = async (req, res) => { 
    try {
        const { wineId, rating, comments } = req.body;
        const userId = req.user.id; // Tomado de forma segura desde el JWT decodificado

        if (!wineId || rating === undefined) {
            return res.status(400).json({ error: 'wineId y rating son requeridos' });
        }

        // Comprobar si el usuario ya calificó este vino
        const existingRating = await Rating.findOne({ user: userId, wine: wineId });
        if (existingRating) {
            return res.status(400).json({ error: 'Ya has calificado este vino anteriormente.' });
        }

        const newRating = new Rating({ user: userId, wine: wineId, rating, comments });
        await newRating.save(); 
        // Nota: Al ejecutarse .save(), automáticamente el pre/post-hook del modelo 
        // recalcula el averageRating en el modelo Wine. No hace falta hacer más nada aquí.

        res.status(201).json(newRating);
    } catch (err) {
        res.status(500).json({ error: 'Error al añadir la calificación', details: err.message });
    }
};

// Obtener las calificaciones de un vino específico
exports.getRatingsByWine = async (req, res) => {
    try {
        const { wineId } = req.params;

        // Trae los ratings y adjunta el username del usuario que comentó
        const ratings = await Rating.find({ wine: wineId })
                                    .populate('user', 'username')
                                    .sort({ createdAt: -1 }); // Los más recientes primero
                                    
        res.status(200).json(ratings);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener las calificaciones' });
    }
};

// Actualizar una calificación
exports.updateRating = async (req, res) => {
    try {
        const ratingId = req.params.id; // Tomado de la URL
        const userId = req.user.id;     // Tomado del Token
        const { rating, comments } = req.body;

        // Buscamos la calificación asegurándonos que le pertenezca a quien la quiere editar
        const existingRating = await Rating.findOne({ _id: ratingId, user: userId });
        if (!existingRating) {
            return res.status(404).json({ error: 'Calificación no encontrada o no tienes permisos' });
        }

        if (rating !== undefined) existingRating.rating = rating;
        if (comments !== undefined) existingRating.comments = comments;
        
        await existingRating.save(); // Dispara de nuevo el recálculo automático del promedio

        res.status(200).json(existingRating);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar la calificación' });
    }
};

// Eliminar una calificación
exports.deleteRating = async (req, res) => {
    try {
        const ratingId = req.params.id; // Tomado de la URL
        const userId = req.user.id;     // Tomado del Token

        // Buscamos y eliminamos en un solo paso si coincide con el usuario dueño
        const deletedRating = await Rating.findOneAndDelete({ _id: ratingId, user: userId });
        
        if (!deletedRating) {
            return res.status(404).json({ error: 'Calificación no encontrada o no tienes permisos' });
        }
        // Nota: Al usarse findOneAndDelete, el hook post('findOneAndDelete') 
        // que programamos en el modelo actualiza el promedio en Wine de forma automática.

        res.status(200).json({ message: 'Calificación eliminada de forma exitosa' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar la calificación' });
    }
};

// Dar o quitar Like a una reseña (Toggle)
exports.toggleLikeRating = async (req, res) => {
    try {
        const ratingId = req.params.id;
        const userId = req.user.id; // ID del usuario logueado

        const rating = await Rating.findById(ratingId);
        if (!rating) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }

        // Verificamos si el usuario ya le dio like
        const hasLiked = rating.likes.includes(userId);

        if (hasLiked) {
            // Si ya tiene like, se lo removemos ($pull)
            await Rating.findByIdAndUpdate(ratingId, { $pull: { likes: userId } });
            res.status(200).json({ message: 'Like removido' });
        } else {
            // Si no tiene like, se lo agregamos ($addToSet evita duplicados)
            await Rating.findByIdAndUpdate(ratingId, { $addToSet: { likes: userId } });
            res.status(200).json({ message: 'Reseña cliqueada con Like con éxito' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al procesar el like', details: err.message });
    }
};