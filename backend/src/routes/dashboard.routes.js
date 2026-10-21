const router = require('express').Router();
const db = require('../config/db');

router.get('/', async (req, res, next) => {
  try {
    const [[p]] = await db.query('SELECT COUNT(*) AS total FROM productos');
    const [[c]] = await db.query('SELECT COUNT(*) AS total FROM clientes');
    const [[pr]] = await db.query('SELECT COUNT(*) AS total FROM proveedores');
    const [[v]] = await db.query('SELECT COALESCE(SUM(total), 0) AS total FROM ventas');
    const [[co]] = await db.query('SELECT COALESCE(SUM(total), 0) AS total FROM compras');
    const [[sb]] = await db.query('SELECT COUNT(*) AS total FROM productos WHERE stock <= 10');

    res.status(200).json({
      success: true,
      data: {
        productos: p.total,
        clientes: c.total,
        proveedores: pr.total,
        ventas: Number(v.total),
        compras: Number(co.total),
        stockBajo: sb.total,
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
