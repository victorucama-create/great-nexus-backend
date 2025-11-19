const express = require("express");
const router = express.Router();

const invCtrl = require("../controllers/inventory.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { tenantMiddleware } = require("../middleware/tenant.middleware");

// ===========================
// INVENTORY - Multi-tenant
// ===========================

// Listar movimentos de estoque
router.get(
  "/movements",
  authMiddleware,
  tenantMiddleware,
  requireRole("tenant_admin", "inventory_manager"),
  invCtrl.listMovements
);

// Criar movimento de ajuste
router.post(
  "/movement",
  authMiddleware,
  tenantMiddleware,
  requireRole("tenant_admin", "inventory_manager"),
  invCtrl.createMovement
);

// Transferência entre armazéns
router.post(
  "/transfer",
  authMiddleware,
  tenantMiddleware,
  requireRole("tenant_admin", "inventory_manager"),
  invCtrl.transfer
);

module.exports = router;
