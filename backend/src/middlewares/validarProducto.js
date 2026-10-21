module.exports = (req, res, next) => {
  const { nombre, codigo, precio, stock } = req.body;
  const errores = [];

  if (!nombre || String(nombre).trim() === '') errores.push('El nombre es obligatorio');
  if (!codigo || String(codigo).trim() === '') errores.push('El código es obligatorio');
  if (precio === undefined || isNaN(precio) || Number(precio) <= 0)
    errores.push('El precio debe ser mayor que 0');
  if (stock === undefined || isNaN(stock) || Number(stock) < 0)
    errores.push('El stock debe ser mayor o igual a 0');

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos incorrectos',
        detalles: errores,
      },
    });
  }
  next();
};
