const express = require("express");
const Tenant = require("../models/Tenant.model");

const router = express.Router();

// Create a new tenant
router.post("/", async (req, res) => {
  try {
    const tenant = await Tenant.create(req.body);

    res.json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// List tenants
router.get("/", async (req, res) => {
  const tenants = await Tenant.find();
  res.json({ success: true, data: tenants });
});

// Update tenant
router.put("/:id", async (req, res) => {
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
router.put("/:id/suspend", async (req, res) => {
  const updated = await Tenant.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );

  res.json({ success: true, data: updated });
});

// Activate tenant
router.put("/:id/activate", async (req, res) => {
  const updated = await Tenant.findByIdAndUpdate(
    req.params.id,
    { active: true },
    { new: true }
  );

  res.json({ success: true, data: updated });
});

module.exports = router;
