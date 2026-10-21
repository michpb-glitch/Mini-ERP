const router = require('express').Router();
const db = require('../config/db');

// GET /api/inventario?stockBajo=true&umbral=10
router.get('/', async (req, res, next) => {
  try {
    const umbral = parseInt(req.query.umbral) || 10;
    const soloBajo = req.query.stockBajo === 'true';

    const [rows] = await db.query(
      `SELECT id, nombre, codigo, categoria, stock,
              CASE WHEN stock <= ? THEN 'BAJO' ELSE 'OK' END AS estado
       FROM productos
       ${soloBajo ? 'WHERE stock <= ?' : ''}
       ORDER BY stock ASC`,
      soloBajo ? [umbral, umbral] : [umbral]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (err) { next(err); }
});

module.exports = router;
