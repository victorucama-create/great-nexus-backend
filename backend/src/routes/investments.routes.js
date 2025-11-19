const express = require("express");
const router = express.Router();
const molaController = require("../controllers/mola.controller");
const { requireRole } = require("../middleware/role.middleware");

// Listar investimentos do tenant atual
router.get("/", molaController.getAllInvestments);

// Criar investimento
router.post("/", requireRole("tenant_admin"), molaController.createInvestment);

// Calcular rendimento
router.post("/calculate", molaController.calculateProfit);

// Histórico
router.get("/history", molaController.getInvestmentHistory);

module.exports = router;
