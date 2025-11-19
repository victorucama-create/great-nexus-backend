const Purchase = require('../models/Purchase.model');
const Product = require('../models/Product.model');
const StockMovement = require('../models/StockMovement.model');
const mongoose = require('mongoose');

exports.create = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const tenantId = req.tenant._id;
    const payload = { ...req.body, tenantId, createdBy: req.user._id };

    // calculate total
    payload.total = (payload.items || []).reduce((s,i)=> s + (i.qty * (i.price || 0)), 0);

    const purchase = await Purchase.create([payload], { session });

    // if status is received, increase stock
    if (payload.status === 'received') {
      for (const item of payload.items) {
        await Product.findOneAndUpdate(
          { _id: item.productId, tenantId },
          { $inc: { stock: item.qty } },
          { session }
        );

        await StockMovement.create([{
          tenantId,
          productId: item.productId,
          sku: item.sku || undefined,
          qty: item.qty,
          type: 'purchase',
          reference: payload.reference || purchase._id,
          createdBy: req.user._id
        }], { session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ success:true, data: purchase[0] });
  } catch (err) {
    await session.abortTransaction(); session.endSession();
    res.status(500).json({ success:false, error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    const items = await Purchase.find({ tenantId }).sort({ createdAt:-1 });
    res.json({ success:true, data: items });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};
