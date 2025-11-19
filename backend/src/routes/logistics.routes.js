const express = require("express");
const router = express.Router();
const logisticsController = require("../controllers/logistics.controller");
const { requireRole } = require("../middleware/role.middleware");

// Expedição
router.get("/shipments", logisticsController.getShipments);
router.post("/shipments", requireRole("tenant_admin", "logistics_manager"), logisticsController.createShipment);

// Rastreio
router.get("/track/:id", logisticsController.trackShipment);

module.exports = router;
