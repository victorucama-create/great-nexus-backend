const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Types.ObjectId, ref: 'Tenant', index: true, required: true },
  sku: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  categoryId: { type: mongoose.Types.ObjectId, ref: 'Category', default: null },
  price: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  // total stock across warehouses can be computed, but keep cached stock for quick reads
  stock: { type: Number, default: 0 },
  unit: { type: String, default: 'un' },
  attributes: { type: Object, default: {} }, // e.g. tamanho, cor
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ProductSchema.index({ tenantId: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('Product', ProductSchema);
