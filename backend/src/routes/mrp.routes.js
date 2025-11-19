const express = require("express");
const router = express.Router();
const mrpController = require("../controllers/mrp.controller");
const { requireRole } = require("../middleware/role.middleware");

// BOM (Bill of Materials)
router.get("/bom", mrpController.getBOM);
router.post("/bom", requireRole("tenant_admin", "production_manager"), mrpController.createBOM);

// Ordens de Produção
router.get("/orders", mrpController.getProductionOrders);
router.post("/orders", requireRole("tenant_admin", "production_manager"), mrpController.createProductionOrder);

module.exports = router;
