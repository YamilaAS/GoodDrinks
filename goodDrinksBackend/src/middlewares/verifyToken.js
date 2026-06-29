const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Obtener el encabezado de autorización
    const authHeader = req.header('Authorization');
    
    // 2. Validar que el encabezado exista y empiece con 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Acceso denegado. No se proporcionó un token válido.' 
        });
    }

    // 3. Extraer el token (quitamos la palabra 'Bearer ' que ocupa el índice 0)
    const token = authHeader.split(' ')[1];

    try {
        // 4. Verificar el token usando la clave secreta
        const verified = jwt.verify(token, process.env.TOKEN_API_VINOS);
        
        // 5. Inyectar los datos del usuario verificado en el objeto request
        req.user = verified; 
        
        // 6. Ceder el control al siguiente middleware o controlador
        next();
    } catch (err) {
        // 401 es más preciso para tokens inválidos o expirados que 400
        return res.status(401).json({ 
            error: 'Token inválido o expirado' 
        });
    }
};

module.exports = verifyToken;