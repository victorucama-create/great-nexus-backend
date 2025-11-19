const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Types.ObjectId, ref: 'Tenant', index: true, required: true },
  reference: { type: String },
  items: [{
    productId: { type: mongoose.Types.ObjectId, ref: 'Product' },
    sku: String,
    qty: Number,
    price: Number
  }],
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['draft','confirmed','paid','cancelled'], default: 'draft' },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Sale', SaleSchema);
