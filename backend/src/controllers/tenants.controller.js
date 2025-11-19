const Tenant = require("../models/Tenant.model");

module.exports = {
  // Create tenant — super admin
  createTenant: async (req, res) => {
    try {
      const tenant = await Tenant.create(req.body);
      res.json({ success: true, data: tenant });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  // List tenants
  listTenants: async (req, res) => {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tenants });
  },

  // Get tenant
  getTenant: async (req, res) => {
    const t = await Tenant.findById(req.params.id);
    if (!t)
      return res.status(404).json({ success: false, error: "Tenant não encontrado" });

    res.json({ success: true, data: t });
  },

  // Update tenant
  updateTenant: async (req, res) => {
    try {
      const updated = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  // Suspend tenant
  suspendTenant: async (req, res) => {
    const updated = await Tenant.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    res.json({ success: true, data: updated });
  },

  // Activate tenant
  activateTenant: async (req, res) => {
    const updated = await Tenant.findByIdAndUpdate(
      req.params.id,
      { active: true },
      { new: true }
    );
    res.json({ success: true, data: updated });
  },

  // Tenant self-info
  getMyTenant: async (req, res) => {
    const tenant = await Tenant.findById(req.tenantId);
    res.json({ success: true, data: tenant });
  },

  // Tenant updates his own company profile
  updateMyTenant: async (req, res) => {
    const updated = await Tenant.findByIdAndUpdate(req.tenantId, req.body, {
      new: true,
    });
    res.json({ success: true, data: updated });
  },

  // Change plan
  changePlan: async (req, res) => {
    const { plan } = req.body;

    const updated = await Tenant.findByIdAndUpdate(
      req.tenantId,
      { plan },
      { new: true }
    );

    res.json({ success: true, data: updated });
  },
};
