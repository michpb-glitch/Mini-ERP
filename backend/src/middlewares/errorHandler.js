module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      error: { code: 'DUPLICATE_ENTRY', message: 'Ya existe un registro con ese código o dato único' },
    });
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      success: false,
      error: { code: 'IN_USE', message: 'No se puede eliminar: el registro está relacionado con otros datos' },
    });
  }

  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Error del servidor' },
  });
};
