module.exports = (req, res, next) => {
  const { nombre, rfc, telefono, correo } = req.body;
  const errores = [];

  if (!nombre || String(nombre).trim() === '') errores.push('El nombre es obligatorio');
  if (!rfc || !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(String(rfc).trim()))
    errores.push('El RFC es obligatorio y debe tener formato válido (12 o 13 caracteres)');
  if (telefono && !/^\d{10}$/.test(String(telefono)))
    errores.push('El teléfono debe tener 10 dígitos');
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo)))
    errores.push('El correo no tiene un formato válido');

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Datos incorrectos', detalles: errores },
    });
  }
  next();
};
