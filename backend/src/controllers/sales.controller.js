const Sale = require('../models/Sale.model');
const Product = require('../models/Product.model');
const StockMovement = require('../models/StockMovement.model');
const mongoose = require('mongoose');

exports.create = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tenantId = req.tenant._id;
    const payload = { ...req.body, tenantId, createdBy: req.user._id };
    payload.total = (payload.items || []).reduce((s,i)=> s + (i.qty * (i.price || 0)), 0);

    // Decrease stock for all items (atomically)
    for (const item of payload.items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, tenantId, stock: { $gte: item.qty } },
        { $inc: { stock: -Math.abs(item.qty) } },
        { new: true, session }
      );
      if (!updated) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ success:false, error: `Insufficient stock for product ${item.productId}` });
      }

      await StockMovement.create([{
        tenantId,
        productId: item.productId,
        sku: item.sku || updated.sku,
        qty: -Math.abs(item.qty),
        type: 'sale',
        reference: payload.reference || null,
        createdBy: req.user._id
      }], { session });
    }

    const sale = await Sale.create([payload], { session });

    await session.commitTransaction(); session.endSession();
    res.json({ success:true, data: sale[0] });
  } catch (err) {
    await session.abortTransaction(); session.endSession();
    res.status(500).json({ success:false, error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    const items = await Sale.find({ tenantId }).sort({ createdAt:-1 });
    res.json({ success:true, data: items });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};
