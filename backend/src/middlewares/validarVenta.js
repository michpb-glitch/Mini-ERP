module.exports = (req, res, next) => {
  const { clienteId, fecha, productos } = req.body;
  const errores = [];

  if (!Number.isInteger(Number(clienteId)) || Number(clienteId) <= 0)
    errores.push('clienteId es obligatorio y debe ser un número válido');

  if (fecha && isNaN(Date.parse(fecha)))
    errores.push('La fecha no tiene un formato válido (AAAA-MM-DD)');

  if (!Array.isArray(productos) || productos.length === 0) {
    errores.push('Debes incluir al menos un producto');
  } else {
    productos.forEach((p, i) => {
      if (!Number.isInteger(Number(p.productoId)) || Number(p.productoId) <= 0)
        errores.push(`productos[${i}]: productoId inválido`);
      if (!Number.isInteger(Number(p.cantidad)) || Number(p.cantidad) <= 0)
        errores.push(`productos[${i}]: la cantidad debe ser un entero mayor que 0`);
    });
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Datos incorrectos', detalles: errores },
    });
  }
  next();
};
