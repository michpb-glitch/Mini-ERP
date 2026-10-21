const router = require('express').Router();
const c = require('../controllers/productos.controller');
const validarProducto = require('../middlewares/validarProducto');
const { soloAdmin } = require('../middlewares/auth');

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', validarProducto, c.crear);
router.put('/:id', validarProducto, c.actualizar);
router.delete('/:id', soloAdmin, c.eliminar);

module.exports = router;
