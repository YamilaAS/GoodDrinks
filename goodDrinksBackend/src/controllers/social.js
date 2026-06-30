const User = require('../models/user');
const Rating = require('../models/rating');

// Seguir a un usuario
exports.followUser = async (req, res) => {
    try {
        const userToFollowId = req.params.id;
        const myUserId = req.user.id; // Mi ID desde el JWT

        if (userToFollowId === myUserId) {
            return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
        }

        // 1. Agregar a mi lista de "following" (A quiénes sigo)
        // $addToSet evita duplicados por si mandas la petición dos veces
        await User.findByIdAndUpdate(myUserId, { $addToSet: { following: userToFollowId } });

        // 2. Agregar a la lista de "followers" del otro usuario (Quiénes lo siguen)
        await User.findByIdAndUpdate(userToFollowId, { $addToSet: { followers: myUserId } });

        res.status(200).json({ message: 'Usuario seguido con éxito' });
    } catch (err) {
        res.status(500).json({ error: 'Error al seguir al usuario', details: err.message });
    }
};

// Dejar de seguir a un usuario
exports.unfollowUser = async (req, res) => {
    try {
        const userToUnfollowId = req.params.id;
        const myUserId = req.user.id;

        // $pull remueve el elemento del array
        await User.findByIdAndUpdate(myUserId, { $pull: { following: userToUnfollowId } });
        await User.findByIdAndUpdate(userToUnfollowId, { $pull: { followers: myUserId } });

        res.status(200).json({ message: 'Has dejado de seguir al usuario' });
    } catch (err) {
        res.status(500).json({ error: 'Error al dejar de seguir al usuario' });
    }
};

// El Feed / Muro de Novedades estilo Goodreads
exports.getFeed = async (req, res) => {
    try {
        const myUserId = req.user.id;

        // 1. Buscar mi usuario para saber a quiénes sigo
        const me = await User.findById(myUserId);
        
        if (!me.following || me.following.length === 0) {
            return res.status(200).json({ 
                message: 'Aún no sigues a nadie. ¡Sigue a otros usuarios para ver sus reseñas!', 
                feed: [] 
            });
        }

        // 2. Buscar las calificaciones cuyos autores estén en mi lista de "following"
        const feed = await Rating.find({ user: { $in: me.following } })
                                 .populate('user', 'username email') // Trae quién lo comentó (solo datos públicos)
                                 .populate('wine', 'name winery type imageUrl') // Trae los datos del vino
                                 .sort({ createdAt: -1 }) // Mostrar lo más reciente primero
                                 .limit(20); // Top 20 actividades

        res.status(200).json(feed);
    } catch (err) {
        res.status(500).json({ error: 'Error al cargar el feed de novedades', details: err.message });
    }
};
