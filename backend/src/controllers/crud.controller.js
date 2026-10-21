module.exports = (service, { singular, codigo }) => {
  const noEncontrado = (res) =>
    res.status(404).json({
      success: false,
      error: { code: codigo, message: `El ${singular} solicitado no existe` },
    });

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
      const item = await service.obtenerPorId(req.params.id);
      if (!item) return noEncontrado(res);
      res.status(200).json({ success: true, data: item });
    } catch (err) { next(err); }
  };

  const crear = async (req, res, next) => {
    try {
      const item = await service.crear(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (err) { next(err); }
  };

  const actualizar = async (req, res, next) => {
    try {
      const item = await service.actualizar(req.params.id, req.body);
      if (!item) return noEncontrado(res);
      res.status(200).json({ success: true, data: item });
    } catch (err) { next(err); }
  };

  const eliminar = async (req, res, next) => {
    try {
      const ok = await service.eliminar(req.params.id);
      if (!ok) return noEncontrado(res);
      res.status(200).json({ success: true, message: `${singular[0].toUpperCase()}${singular.slice(1)} eliminado` });
    } catch (err) { next(err); }
  };

  return { listar, obtener, crear, actualizar, eliminar };
};
