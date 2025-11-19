const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  supplierId: { type: mongoose.Types.ObjectId, ref: 'Supplier' },
  reference: { type: String },
  items: [{
    productId: { type: mongoose.Types.ObjectId, ref: 'Product' },
    sku: String,
    qty: Number,
    price: Number
  }],
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['draft','ordered','received','cancelled'], default: 'draft' },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', PurchaseSchema);
