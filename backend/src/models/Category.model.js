const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Types.ObjectId, ref: 'Tenant', index: true, required: true },
  name: { type: String, required: true },
  parentId: { type: mongoose.Types.ObjectId, ref: 'Category', default: null },
  description: { type: String, default: null },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
