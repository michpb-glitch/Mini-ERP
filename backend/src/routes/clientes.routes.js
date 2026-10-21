const router = require('express').Router();
const service = require('../services/crud.service')('clientes');
const c = require('../controllers/crud.controller')(service, { singular: 'cliente', codigo: 'CLIENT_NOT_FOUND' });
const validarPersona = require('../middlewares/validarPersona');
const { soloAdmin } = require('../middlewares/auth');

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', validarPersona, c.crear);
router.put('/:id', validarPersona, c.actualizar);
router.delete('/:id', soloAdmin, c.eliminar);

module.exports = router;
