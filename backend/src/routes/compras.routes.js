const router = require('express').Router();
const c = require('../controllers/compras.controller');
const validarCompra = require('../middlewares/validarCompra');

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', validarCompra, c.crear);

module.exports = router;
