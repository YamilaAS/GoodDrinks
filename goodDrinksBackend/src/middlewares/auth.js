const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_API_VINOS);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token no válido.' });
    }
};

module.exports = authenticate;
