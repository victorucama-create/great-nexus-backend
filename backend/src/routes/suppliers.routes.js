const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/suppliers.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { tenantMiddleware } = require("../middleware/tenant.middleware");

// ===========================
// SUPPLIERS - Fornecedores
// ===========================

// Listar fornecedores por tenant
router.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  ctrl.list
);

// Criar fornecedor
router.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  requireRole("tenant_admin", "inventory_manager"),
  ctrl.create
);

// Atualizar fornecedor
router.put(
  "/:id",
  authMiddleware,
  tenantMiddleware,
  requireRole("tenant_admin", "inventory_manager"),
  ctrl.update
);

// Remover fornecedor
router.delete(
  "/:id",
  authMiddleware,
  tenantMiddleware,
  requireRole("tenant_admin"),
  ctrl.delete
);

module.exports = router;
