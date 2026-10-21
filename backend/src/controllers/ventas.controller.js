const service = require('../services/ventas.service');

const listar = async (req, res, next) => {
  try {
    const { rows, total, page, limit } = await service.obtenerTodos(req.query);
    res.status(200).json({
      success: true,
      data: rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const venta = await service.obtenerPorId(req.params.id);
    if (!venta) {
      return res.status(404).json({
        success: false,
        error: { code: 'SALE_NOT_FOUND', message: 'La venta solicitada no existe' },
      });
    }
    res.status(200).json({ success: true, data: venta });
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const venta = await service.crear(req.body);
    res.status(201).json({ success: true, data: venta });
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear };
