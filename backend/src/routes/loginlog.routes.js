const express = require("express");
const router = express.Router();

const loginLogController = require("../controllers/loginlog.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// ======================================================
// MIDDLEWARES NECESSÁRIOS:
// authMiddleware.verifyToken → verifica JWT
// roleMiddleware.requireSuperAdmin → apenas super admin
// roleMiddleware.requireTenantAdmin → admin do tenant
// ======================================================

// ------------------------------------------------------
// 1) LISTAR TODOS OS LOGS (SUPER ADMIN)
// ------------------------------------------------------
router.get(
  "/",
  authMiddleware.verifyToken,
  roleMiddleware.requireSuperAdmin,
  loginLogController.listAll
);

// ------------------------------------------------------
// 2) LISTAR LOGS DO PRÓPRIO TENANT (Tenant Admin)
// ------------------------------------------------------
router.get(
  "/tenant",
  authMiddleware.verifyToken,
  roleMiddleware.requireTenantAdmin,
  loginLogController.listByTenant
);

// ------------------------------------------------------
// 3) LISTAR LOGS POR UTILIZADOR
// ------------------------------------------------------
router.get(
  "/user/:id",
  authMiddleware.verifyToken,
  loginLogController.listByUser
);

// ------------------------------------------------------
// 4) FILTRO AVANÇADO
// Exemplo:
// GET /api/loginlogs/filter?success=true&country=MZ&startDate=2024-01-01
// ------------------------------------------------------
router.get(
  "/filter",
  authMiddleware.verifyToken,
  loginLogController.filter
);

// ------------------------------------------------------
// 5) EXPORTAR LOGS EM CSV (SUPER ADMIN)
// ------------------------------------------------------
router.get(
  "/export/csv",
  authMiddleware.verifyToken,
  roleMiddleware.requireSuperAdmin,
  loginLogController.exportCSV
);

// ------------------------------------------------------
// 6) EXPORTAR LOGS EM JSON (SUPER ADMIN)
// ------------------------------------------------------
router.get(
  "/export/json",
  authMiddleware.verifyToken,
  roleMiddleware.requireSuperAdmin,
  loginLogController.exportJSON
);

module.exports = router;
