const express = require("express");
const router = express.Router();

const uacController = require("../controllers/uac.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

// SUPER ADMIN APENAS
router.post(
  "/permissions",
  auth.verifyToken,
  role.requireSuperAdmin,
  uacController.createPermission
);

router.post(
  "/roles",
  auth.verifyToken,
  role.requireSuperAdmin,
  uacController.createRole
);

// ADMIN DO TENANT
router.post(
  "/assign-role",
  auth.verifyToken,
  role.requireTenantAdmin,
  uacController.assignRole
);

router.post(
  "/assign-permission",
  auth.verifyToken,
  role.requireTenantAdmin,
  uacController.assignPermission
);

// PERMISSÕES DO USUÁRIO
router.get(
  "/permissions/:id",
  auth.verifyToken,
  uacController.getUserPermissions
);

module.exports = router;
