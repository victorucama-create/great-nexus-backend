const express = require("express");
const router = express.Router();
const salesController = require("../controllers/sales.controller");
const { requireRole } = require("../middleware/role.middleware");

// Listar vendas
router.get("/", salesController.getAllSales);

// Ver 1 venda
router.get("/:id", salesController.getSaleById);

// Criar venda
router.post("/", requireRole("tenant_admin", "sales_manager", "cashier"), salesController.createSale);

// Atualizar venda
router.put("/:id", requireRole("tenant_admin", "sales_manager"), salesController.updateSale);

// Cancelar venda
router.delete("/:id", requireRole("tenant_admin"), salesController.deleteSale);

module.exports = router;
