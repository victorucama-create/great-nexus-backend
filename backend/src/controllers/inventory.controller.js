const Product = require('../models/Product.model');
const StockMovement = require('../models/StockMovement.model');
const Warehouse = require('../models/Warehouse.model');
const mongoose = require('mongoose');

// Create stock movement (in/out/adjustment/transfer)
exports.createMovement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tenantId = req.tenant._id;
    const { productId, qty, type, warehouseFrom, warehouseTo, reason, reference } = req.body;

    if (!['in','out','adjustment','transfer','purchase','sale'].includes(type)) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success:false, error: 'Invalid movement type' });
    }
    if (!productId || !qty) { await session.abortTransaction(); session.endSession(); return res.status(400).json({ success:false, error: 'productId and qty required' }); }

    // Update product cached stock atomically
    // For 'out' movements subtract, for 'in' add
    const delta = (type === 'out' || type === 'sale' || type === 'transfer' && warehouseFrom) ? -Math.abs(qty) : Math.abs(qty);

    // find and update atomically, preventing negative stock
    const updated = await Product.findOneAndUpdate(
      { _id: productId, tenantId, stock: { $gte: Math.max(0, -delta) } }, // ensure enough stock when decreasing
      { $inc: { stock: delta } },
      { new: true, session }
    );

    if (!updated && delta < 0) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success:false, error: 'Insufficient stock' });
    }

    // create movement
    const movement = await StockMovement.create([{
      tenantId,
      productId,
      sku: updated ? updated.sku : undefined,
      qty: delta,
      type,
      reason,
      warehouseFrom: warehouseFrom || null,
      warehouseTo: warehouseTo || null,
      reference,
      createdBy: req.user._id
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success:true, data: movement[0] });
  } catch (err) {
    await session.abortTransaction(); session.endSession();
    res.status(500).json({ success:false, error: err.message });
  }
};

// List movements with filters
exports.listMovements = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    const q = { tenantId };

    if (req.query.productId) q.productId = req.query.productId;
    if (req.query.type) q.type = req.query.type;
    if (req.query.startDate || req.query.endDate) {
      q.createdAt = {};
      if (req.query.startDate) q.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) q.createdAt.$lte = new Date(req.query.endDate);
    }

    const items = await StockMovement.find(q).populate('productId','name sku').sort({ createdAt:-1 });
    res.json({ success:true, data: items });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};

// Transfer between warehouses (wrapper around createMovement for atomicity)
exports.transfer = async (req, res) => {
  // body: productId, qty, fromWarehouse, toWarehouse, reference
  try {
    const tenantId = req.tenant._id;
    const { productId, qty, fromWarehouse, toWarehouse, reference } = req.body;
    if (!productId || !qty || !fromWarehouse || !toWarehouse) return res.status(400).json({ success:false, error: 'missing params' });

    // create out from fromWarehouse then in to toWarehouse using createMovement but in same transaction
    // reuse createMovement logic or implement here similar to above (omitted for brevity)
    // For now call createMovement twice or implement a transactional transfer.
    req.body.type = 'transfer';
    req.body.warehouseFrom = fromWarehouse;
    req.body.warehouseTo = toWarehouse;
    return exports.createMovement(req, res);
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};
