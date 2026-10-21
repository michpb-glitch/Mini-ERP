const service = require('../services/productos.service');

const noEncontrado = (res) =>
  res.status(404).json({
    success: false,
    error: { code: 'PRODUCT_NOT_FOUND', message: 'El producto solicitado no existe' },
  });

const listar = async (req, res, next) => {
  try {
    const { rows, total, page, limit } = await service.obtenerTodos(req.query);
    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const producto = await service.obtenerPorId(req.params.id);
    if (!producto) return noEncontrado(res);
    res.status(200).json({ success: true, data: producto });
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const producto = await service.crear(req.body);
    res.status(201).json({ success: true, data: producto });
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const producto = await service.actualizar(req.params.id, req.body);
    if (!producto) return noEncontrado(res);
    res.status(200).json({ success: true, data: producto });
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    const ok = await service.eliminar(req.params.id);
    if (!ok) return noEncontrado(res);
    res.status(200).json({ success: true, message: 'Producto eliminado' });
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
