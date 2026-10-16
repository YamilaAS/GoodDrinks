const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acceso denegado. No se proporcionó un token válido.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || process.env.TOKEN_API_VINOS;
    
    if (!secret) {
      return res.status(500).json({ error: 'Clave secreta JWT no configurada en el servidor' });
    }

    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
};

module.exports = verifyToken;