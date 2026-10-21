const router = require('express').Router();
const service = require('../services/crud.service')('proveedores');
const c = require('../controllers/crud.controller')(service, { singular: 'proveedor', codigo: 'SUPPLIER_NOT_FOUND' });
const validarPersona = require('../middlewares/validarPersona');
const { soloAdmin } = require('../middlewares/auth');

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', validarPersona, c.crear);
router.put('/:id', validarPersona, c.actualizar);
router.delete('/:id', soloAdmin, c.eliminar);

module.exports = router;
