const express = require("express");
const router = express.Router();
const hrController = require("../controllers/hr.controller");
const { requireRole } = require("../middleware/role.middleware");

// Funcionários
router.get("/employees", hrController.getEmployees);
router.post("/employees", requireRole("tenant_admin", "hr_manager"), hrController.createEmployee);
router.put("/employees/:id", hrController.updateEmployee);
router.delete("/employees/:id", requireRole("tenant_admin"), hrController.deleteEmployee);

// Payroll
router.get("/payroll", hrController.getPayroll);
router.post("/payroll/calculate", hrController.calculatePayroll);

module.exports = router;
