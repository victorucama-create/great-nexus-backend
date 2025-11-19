const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/purchases.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', auth.verifyToken, role.requireTenantAdmin, ctrl.getAll);
router.post('/', auth.verifyToken, role.requireTenantAdmin, ctrl.create);

module.exports = router;
