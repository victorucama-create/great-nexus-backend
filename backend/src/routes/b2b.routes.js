const express = require("express");
const router = express.Router();
const b2bController = require("../controllers/b2b.controller");
const { requireRole } = require("../middleware/role.middleware");

// Catálogo B2B
router.get("/catalog", b2bController.getCatalog);

// Encomenda B2B
router.post("/order", requireRole("tenant_admin"), b2bController.createB2BOrder);

// Comissões B2B
router.get("/commissions", requireRole("tenant_admin"), b2bController.getCommissions);

module.exports = router;
