const Product = require('../models/Product.model');
const StockMovement = require('../models/StockMovement.model');

// List products (tenant scoped)
exports.getAll = async (req, res) => {
  try {
    const tenantId = req.tenant ? req.tenant._id : req.user.tenantId;
    const q = { tenantId };

    if (req.query.q) {
      q.$or = [
        { name: new RegExp(req.query.q, 'i') },
        { sku: new RegExp(req.query.q, 'i') }
      ];
    }

    const products = await Product.find(q).sort({ name: 1 });
    res.json({ success: true, data: products });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};

exports.getById = async (req, res) => {
  try {
    const p = await Product.findOne({ _id: req.params.id, tenantId: req.tenant._id });
    if (!p) return res.status(404).json({ success:false, error: 'Product not found' });
    res.json({ success:true, data: p });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    const payload = { ...req.body, tenantId, createdBy: req.user._id };

    // ensure unique SKU per tenant
    const existing = await Product.findOne({ tenantId, sku: payload.sku });
    if (existing) return res.status(400).json({ success:false, error: 'SKU já existe' });

    const product = await Product.create(payload);
    res.json({ success:true, data: product });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      { ...req.body, updatedBy: req.user._id },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success:false, error: 'Product not found' });
    res.json({ success:true, data: updated });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    await Product.findOneAndDelete({ _id: req.params.id, tenantId });
    res.json({ success:true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};

// optional: recalculate cached stock by summing movements
exports.recalcStock = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    const productId = req.params.id;

    const agg = await StockMovement.aggregate([
      { $match: { tenantId: req.tenant._id, productId: require('mongoose').Types.ObjectId(productId) } },
      { $group: { _id: '$productId', qty: { $sum: '$qty' } } }
    ]);

    const stock = (agg[0] && agg[0].qty) || 0;
    await Product.findOneAndUpdate({ _id: productId, tenantId }, { stock });

    res.json({ success:true, data: { productId, stock } });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};
