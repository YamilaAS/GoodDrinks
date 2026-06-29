const Shelf = require('../models/shelf');

// Agregar un vino a una estantería o cambiarlo de estantería si ya existe
exports.addOrUpdateWineInShelf = async (req, res) => {
    try {
        const { wineId, status } = req.body;
        const userId = req.user.id; // Obtenido de forma segura desde el JWT

        if (!wineId || !status) {
            return res.status(400).json({ error: 'wineId y status son requeridos' });
        }

        // upsert: true hace que si no existe lo cree, y si existe lo actualice
        const shelfItem = await Shelf.findOneAndUpdate(
            { user: userId, wine: wineId },
            { status },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ 
            message: `Vino organizado con éxito en la estantería: ${status}`, 
            data: shelfItem 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al organizar el vino en la estantería', details: err.message });
    }
};

// Obtener todas las estanterías del usuario logueado (con los datos completos de los vinos)
exports.getMyShelves = async (req, res) => {
    try {
        const userId = req.user.id;

        // Buscamos los registros del usuario y usamos .populate() para traer toda la info del vino
        const shelves = await Shelf.find({ user: userId })
                                   .populate('wine')
                                   .sort({ updatedAt: -1 });

        // Opcional: Podemos agrupar la respuesta para que el frontend la reciba ya organizada
        const organizedShelves = {
            porProbar: shelves.filter(item => item.status === 'Por probar').map(item => item.wine),
            tomando: shelves.filter(item => item.status === 'Tomando').map(item => item.wine),
            yaTomados: shelves.filter(item => item.status === 'Ya tomados').map(item => item.wine)
        };

        res.status(200).json(organizedShelves);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener tus estanterías' });
    }
};

// Eliminar un vino de las estanterías por completo
exports.removeWineFromShelf = async (req, res) => {
    try {
        const wineId = req.params.wineId;
        const userId = req.user.id;

        const deletedItem = await Shelf.findOneAndDelete({ user: userId, wine: wineId });

        if (!deletedItem) {
            return res.status(404).json({ error: 'El vino no se encontraba en ninguna estantería' });
        }

        res.status(200).json({ message: 'Vino removido de tus estanterías exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al quitar el vino de la estantería' });
    }
};