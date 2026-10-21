const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const login = async (req, res, next) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Usuario y contraseña son obligatorios' },
      });
    }

    const [rows] = await db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    const user = rows[0];
    const valido = user && (await bcrypt.compare(password, user.password));

    if (!valido) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Usuario o contraseña incorrectos' },
      });
    }

    const token = jwt.sign(
      { id: user.id, usuario: user.usuario, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({ success: true, token });
  } catch (err) { next(err); }
};

module.exports = { login };
