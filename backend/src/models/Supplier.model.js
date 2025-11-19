const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  contactName: String,
  email: String,
  phone: String,
  address: String,
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
