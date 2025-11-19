// backend/src/controllers/suppliers.controller.js
// CRUD de fornecedores (suppliers)
const Supplier = require('../models/Supplier.model');

function normalizeTenant(req) {
  return (req.tenant && req.tenant._id) || req.user.tenantId;
}

module.exports = {
  // List suppliers for tenant (with optional search)
  async list(req, res) {
    try {
      const tenantId = normalizeTenant(req);
      const q = { tenantId };

      if (req.query.q) {
        q.$or = [
          { name: new RegExp(req.query.q, 'i') },
          { email: new RegExp(req.query.q, 'i') },
          { phone: new RegExp(req.query.q, 'i') },
        ];
      }

      const suppliers = await Supplier.find(q).sort({ name: 1 });
      return res.json({ success: true, data: suppliers });
    } catch (err) {
      console.error('suppliers.list error', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // Create supplier
  async create(req, res) {
    try {
      const tenantId = normalizeTenant(req);
      const payload = {
        ...req.body,
        tenantId,
        createdBy: req.user._id
      };

      // Basic validation
      if (!payload.name) {
        return res.status(400).json({ success: false, error: 'name is required' });
      }

      const s = await Supplier.create(payload);
      return res.json({ success: true, data: s });
    } catch (err) {
      console.error('suppliers.create error', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // Update supplier
  async update(req, res) {
    try {
      const tenantId = normalizeTenant(req);
      const id = req.params.id;
      const updated = await Supplier.findOneAndUpdate(
        { _id: id, tenantId },
        { ...req.body, updatedBy: req.user._id },
        { new: true }
      );

      if (!updated) return res.status(404).json({ success: false, error: 'Supplier not found' });
      return res.json({ success: true, data: updated });
    } catch (err) {
      console.error('suppliers.update error', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // Delete supplier (soft delete option could be used)
  async delete(req, res) {
    try {
      const tenantId = normalizeTenant(req);
      const id = req.params.id;

      // Option: soft delete: set active: false
      const deleted = await Supplier.findOneAndUpdate(
        { _id: id, tenantId },
        { active: false },
        { new: true }
      );

      if (!deleted) return res.status(404).json({ success: false, error: 'Supplier not found' });
      return res.json({ success: true, message: 'Supplier deactivated', data: deleted });
    } catch (err) {
      console.error('suppliers.delete error', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};
