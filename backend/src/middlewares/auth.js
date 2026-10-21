const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_AUTH', message: 'Token no proporcionado' },
    });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token inválido o expirado' },
    });
  }
};

const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'No tienes permisos para esta acción' },
    });
  }
  next();
};

module.exports = { autenticar, soloAdmin };
