const express = require('express');
const router = express.Router();
const invCtrl = require('../controllers/inventory.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/movements', auth.verifyToken, role.requireTenantAdmin, invCtrl.listMovements);
router.post('/movement', auth.verifyToken, role.requireTenantAdmin, invCtrl.createMovement);
router.post('/transfer', auth.verifyToken, role.requireTenantAdmin, invCtrl.transfer);

module.exports = router;
