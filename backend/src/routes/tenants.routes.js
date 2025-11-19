const express = require("express");
const Tenant = require("../models/Tenant.model");
const { requireRole } = require("../middleware/role.middleware");
const router = express.Router();

/* ===============================================
   1. SUPER ADMIN — TOTAL CONTROL
   =============================================== */

// Create a new tenant
router.post("/", requireRole("super_admin"), async (req, res) => {
  try {
    const tenant = await Tenant.create(req.body);
    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// List all tenants (super admin only)
router.get("/", requireRole("super_admin"), async (req, res) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 });
  res.json({ success: true, data: tenants });
});

// Get a specific tenant
router.get("/:id", requireRole("super_admin"), async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  
  if (!tenant) return res.status(404).json({ success: false, error: "Tenant not found" });

  res.json({ success: true, data: tenant });
});

// Update tenant info
router.put("/:id", requireRole("super_admin"), async (req, res) => {
  try {
    const updated = await Tenant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Suspend tenant
router.put("/:id/suspend", requireRole("super_admin"), async (req, res) => {
  const updated = await Tenant.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );
  res.json({ success: true, data: updated });
});

// Activate tenant
router.put("/:id/activate", requireRole("super_admin"), async (req, res) => {
  const updated = await Tenant.findByIdAndUpdate(
    req.params.id,
    { active: true },
    { new: true }
  );
  res.json({ success: true, data: updated });
});

/* ===============================================
   2. TENANT ADMIN — MY ACCOUNT
   =============================================== */

// Get info of logged user's tenant
router.get("/my/info", async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ success: false, error: "Tenant not identified" });
    }

    const tenant = await Tenant.findById(req.tenantId);

    res.json({ success: true, data: tenant });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tenant updates his own company details
router.put("/my/update", requireRole("tenant_admin"), async (req, res) => {
  try {
    const updated = await Tenant.findByIdAndUpdate(
      req.tenantId,
      req.body,
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/* ===============================================
   3. TENANT — CHANGE PLAN
   =============================================== */

router.put("/my/plan", requireRole("tenant_admin"), async (req, res) => {
  try {
    const { plan } = req.body;

    if (!["starter", "pro", "enterprise"].includes(plan)) {
      return res.status(400).json({ success: false, error: "Invalid plan" });
    }

    const updated = await Tenant.findByIdAndUpdate(
      req.tenantId,
      { plan },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
