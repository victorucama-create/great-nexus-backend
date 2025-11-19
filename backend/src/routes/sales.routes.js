const express = require("express");
const router = express.Router();

const salesCtrl = require("../controllers/sales.controller");
const auth = require("../middleware/auth.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");
const role = require("../middleware/role.middleware");

// ========================================
//     PROTEÇÃO GLOBAL DE TODAS ROTAS
// ========================================
router.use(auth.verifyToken);        // Requer login
router.use(tenantMiddleware);        // Associa tenant à request


// ========================================
//            SALES API (ERP)
// ========================================

// LISTAR TODAS AS VENDAS
router.get(
  "/",
  role.requirePermission("sales.read"),
  salesCtrl.getAll
);

// BUSCAR 1 VENDA POR ID
router.get(
  "/:id",
  role.requirePermission("sales.read"),
  salesCtrl.getById
);

// CRIAR VENDA (ERP)
router.post(
  "/",
  role.requirePermission("sales.write"),
  salesCtrl.create
);

// CRIAR VENDA POS (Ponto de Venda)
router.post(
  "/pos",
  role.requirePermission("sales.pos"),
  salesCtrl.createPOS
);

// CRIAR VENDA ONLINE (via loja)
router.post(
  "/online",
  role.requirePermission("sales.online"),
  salesCtrl.createOnline
);

// ATUALIZAR VENDA
router.put(
  "/:id",
  role.requirePermission("sales.write"),
  salesCtrl.update
);

// CANCELAR VENDA
router.post(
  "/:id/cancel",
  role.requirePermission("sales.cancel"),
  salesCtrl.cancelSale
);

// REEMBOLSO (refund)
router.post(
  "/:id/refund",
  role.requirePermission("sales.refund"),
  salesCtrl.refundSale
);

// APAGAR DEFINITIVAMENTE (somente super admin ou tenant_admin)
router.delete(
  "/:id",
  role.requirePermission("sales.delete"),
  salesCtrl.delete
);

// ========================================
//          RELATÓRIOS
// ========================================

// Relatório diário
router.get(
  "/reports/daily",
  role.requirePermission("sales.read"),
  salesCtrl.dailyReport
);

// Relatório mensal
router.get(
  "/reports/monthly",
  role.requirePermission("sales.read"),
  salesCtrl.monthlyReport
);

module.exports = router;
