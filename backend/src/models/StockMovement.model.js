const mongoose = require('mongoose');

const StockMovementSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  productId: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String },
  qty: { type: Number, required: true },
  type: { type: String, enum: ['in','out','adjustment','transfer','purchase','sale'], required: true },
  reason: { type: String },
  warehouseFrom: { type: mongoose.Types.ObjectId, ref: 'Warehouse', default: null },
  warehouseTo: { type: mongoose.Types.ObjectId, ref: 'Warehouse', default: null },
  reference: { type: String }, // e.g. invoice number, purchase order
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', StockMovementSchema);
