const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/suppliers.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', auth.verifyToken, ctrl.list);
router.post('/', auth.verifyToken, role.requireTenantAdmin, ctrl.create);
router.put('/:id', auth.verifyToken, role.requireTenantAdmin, ctrl.update);
router.delete('/:id', auth.verifyToken, role.requireTenantAdmin, ctrl.delete);

module.exports = router;
