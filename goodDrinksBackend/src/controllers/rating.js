const Rating = require('../models/rating');
const Wine = require('../models/wine');
const User = require('../models/user');


exports.createRating = async (req, res) => { 
    try {
        const { userId, wineId, rating, comments } = req.body;

        if (!userId || !wineId || rating === undefined) {
            return res.status(400).json({ message: 'Datos incompletos: userId, wineId y rating son requeridos' });
        }
        console.log('Datos recibidos:', { userId, wineId, rating, comments });

        const existingRating = await Rating.findOne({ user: userId, wine: wineId });
        if (existingRating) {
            return res.status(400).json({ message: 'Ya has comentado sobre este vino.' });
        }

        const newRating = new Rating({ user: userId, wine: wineId, rating, comments });
        await newRating.save();

        console.log('Nueva calificación guardada:', newRating);

        const ratings = await Rating.find({ wine: wineId });
        const totalRatings = ratings.length;
        const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = sumRatings / totalRatings;

        console.log('Calificaciones totales:', totalRatings);
        console.log('Suma de calificaciones:', sumRatings);
        console.log('Calificación promedio:', averageRating);

        await Wine.findByIdAndUpdate(wineId, { averageRating });

        res.json(newRating);
    } catch (err) {
        console.error('Error al añadir la calificación:', err);
        res.status(500).json({ message: 'Error al añadir la calificación', error: err });
    }
};


// Obtener las calificaciones de un vino específico
exports.getRatingsByWine = async (req, res) => {
    try {
        const wineId = req.params.wineId;
        console.log('wineId:', wineId); 

        const ratings = await Rating.find({ wine: wineId }).populate('user', 'username');
        console.log('ratings:', ratings); // Verificar las calificaciones obtenidas

        res.json(ratings);
    } catch (err) {
        console.error('Error al obtener las calificaciones:', err);
        res.status(500).json({ message: 'Error al obtener las calificaciones', error: err });
        console.log('-------------------------------------------------------------------');
    }
};


// Función para actualizar una calificación
exports.updateRating = async (req, res) => {
    try {
        const { ratingId, userId, rating, comments } = req.body;

        // Verifica que el rating existe y pertenece al usuario
        const existingRating = await Rating.findOne({ _id: ratingId, user: userId });
        if (!existingRating) {
            return res.status(404).json({ message: 'Calificación no encontrada o no pertenece al usuario' });
        }

        // Actualiza los campos necesarios
        if (rating !== undefined) existingRating.rating = rating;
        if (comments !== undefined) existingRating.comments = comments;
        await existingRating.save();

        // Actualiza la calificación promedio del vino
        const ratings = await Rating.find({ wine: existingRating.wine });
        const totalRatings = ratings.length;
        const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = sumRatings / totalRatings;

        await Wine.findByIdAndUpdate(existingRating.wine, { averageRating });

        res.json(existingRating);
    } catch (err) {
        console.error('Error al actualizar la calificación:', err);
        res.status(500).json({ message: 'Error al actualizar la calificación', error: err });
    }
};

// Función para eliminar una calificación
exports.deleteRating = async (req, res) => {
    try {
        const { ratingId, userId } = req.body;

        // Verifica que el rating existe y pertenece al usuario
        const existingRating = await Rating.findOne({ _id: ratingId, user: userId });
        if (!existingRating) {
            return res.status(404).json({ message: 'Calificación no encontrada o no pertenece al usuario' });
        }

        // Elimina la calificación
        await Rating.deleteOne({ _id: ratingId, user: userId });

        // Actualiza la calificación promedio del vino
        const ratings = await Rating.find({ wine: existingRating.wine });
        const totalRatings = ratings.length;
        const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRatings === 0 ? 0 : sumRatings / totalRatings;

        await Wine.findByIdAndUpdate(existingRating.wine, { averageRating });

        res.json({ message: 'Calificación eliminada' });
    } catch (err) {
        console.error('Error al eliminar la calificación:', err);
        res.status(500).json({ message: 'Error al eliminar la calificación', error: err });
    }
};






