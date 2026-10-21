const router = require('express').Router();
const c = require('../controllers/ventas.controller');
const validarVenta = require('../middlewares/validarVenta');

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', validarVenta, c.crear);

module.exports = router;
