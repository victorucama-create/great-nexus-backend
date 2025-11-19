const express = require("express");
const router = express.Router();
const crmController = require("../controllers/crm.controller");
const { requireRole } = require("../middleware/role.middleware");

// Leads
router.get("/leads", crmController.getLeads);
router.post("/leads", requireRole("tenant_admin", "sales_manager"), crmController.createLead);
router.put("/leads/:id", crmController.updateLead);
router.delete("/leads/:id", requireRole("tenant_admin"), crmController.deleteLead);

// Clientes CRM
router.get("/customers", crmController.getCustomers);
router.post("/customers", crmController.createCustomer);

module.exports = router;
