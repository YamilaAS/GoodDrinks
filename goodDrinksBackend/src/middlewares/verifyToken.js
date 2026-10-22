const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso denegado, token no proporcionado' });
  }

  const token = authHeader.split(' ')[1]; // Formato "Bearer <TOKEN>"
  
  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }


  const secret = process.env.JWT_SECRET || process.env.TOKEN_API_VINOS || 'dev_jwt_secret_key_123';

  if (!secret) {
    return res.status(500).json({ error: 'Clave secreta JWT no configurada en el servidor' });
  }

  try {
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;