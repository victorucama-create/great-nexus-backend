const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/purchases.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { tenantMiddleware } = require("../middleware/tenant.middleware");

// ===========================
// PURCHASES - Compras
// ===========================

// Listar compras do tenant
router.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  requireRole("tenant_admin", "inventory_manager", "purchasing_manager"),
  ctrl.getAll
);

// Criar ordem de compra
router.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  requireRole("tenant_admin", "inventory_manager", "purchasing_manager"),
  ctrl.create
);

module.exports = router;
