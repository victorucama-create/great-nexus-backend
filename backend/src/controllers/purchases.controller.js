// backend/src/controllers/purchases.controller.js
// Controller para ordens de compra (Purchase) e recebimento
const mongoose = require('mongoose');
const Purchase = require('../models/Purchase.model');
const Product = require('../models/Product.model');
const StockMovement = require('../models/StockMovement.model');
const Supplier = require('../models/Supplier.model');

function normalizeTenant(req) {
  return (req.tenant && req.tenant._id) || req.user.tenantId;
}

module.exports = {
  // Create purchase order. If status === 'received' the stock is updated.
  // body: { supplierId, reference, items: [{ productId, sku, qty, price }], status }
  async create(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const tenantId = normalizeTenant(req);
      const payload = { ...req.body, tenantId, createdBy: req.user._id };

      if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ success: false, error: 'items array required' });
      }

      // Optional: check supplier belongs to tenant
      if (payload.supplierId) {
        const sup = await Supplier.findOne({ _id: payload.supplierId, tenantId }).session(session);
        if (!sup) {
          await session.abortTransaction(); session.endSession();
          return res.status(400).json({ success: false, error: 'Invalid supplier' });
        }
      }

      // calculate totals
      payload.total = payload.items.reduce((s, it) => s + ((it.qty || 0) * (it.price || 0)), 0);

      const created = await Purchase.create([payload], { session });

      // If purchase is already received, update product stocks and create stock movements
      if (payload.status === 'received') {
        for (const it of payload.items) {
          // validate product exists and tenant
          const product = await Product.findOne({ _id: it.productId, tenantId }).session(session);
          if (!product) {
            await session.abortTransaction(); session.endSession();
            return res.status(400).json({ success: false, error: `Product not found: ${it.productId}` });
          }

          // increase product stock
          await Product.findOneAndUpdate(
            { _id: product._id, tenantId },
            { $inc: { stock: Math.abs(it.qty) } },
            { session }
          );

          // record movement
          await StockMovement.create([{
            tenantId,
            productId: product._id,
            sku: product.sku,
            qty: Math.abs(it.qty),
            type: 'purchase',
            reason: `Purchase ${payload.reference || created[0]._id}`,
            reference: payload.reference || created[0]._id,
            createdBy: req.user._id
          }], { session });
        }
      }

      await session.commitTransaction();
      session.endSession();

      return res.json({ success: true, data: created[0] });
    } catch (err) {
      await session.abortTransaction().catch(()=>{});
      session.endSession();
      console.error('purchases.create error', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // List purchases for tenant (with pagination/filter)
  async getAll(req, res) {
    try {
      const tenantId = normalizeTenant(req);
      const q = { tenantId };

      if (req.query.status) q.status = req.query.status;
      if (req.query.supplierId) q.supplierId = req.query.supplierId;
      if (req.query.startDate || req.query.endDate) {
        q.createdAt = {};
        if (req.query.startDate) q.createdAt.$gte = new Date(req.query.startDate);
        if (req.query.endDate) q.createdAt.$lte = new Date(req.query.endDate);
      }

      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const limit = Math.min(100, parseInt(req.query.limit || '50', 10));
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        Purchase.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('supplierId', 'name'),
        Purchase.countDocuments(q)
      ]);

      return res.json({ success: true, data: items, meta: { page, limit, total } });
    } catch (err) {
      console.error('purchases.getAll error', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // Optional: receive a purchase (change status to received and update stock)
  // POST /:id/receive
  async receive(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const tenantId = normalizeTenant(req);
      const id = req.params.id;

      const purchase = await Purchase.findOne({ _id: id, tenantId }).session(session);
      if (!purchase) {
        await session.abortTransaction(); session.endSession();
        return res.status(404).json({ success: false, error: 'Purchase not found' });
      }

      if (purchase.status === 'received') {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ success: false, error: 'Already received' });
      }

      // Update stocks for each item
      for (const item of purchase.items) {
        const product = await Product.findOne({ _id: item.productId, tenantId }).session(session);
        if (!product) {
          await session.abortTransaction(); session.endSession();
          return res.status(400).json({ success: false, error: `Product not found ${item.productId}` });
        }

        await Product.findOneAndUpdate(
          { _id: product._id, tenantId },
          { $inc: { stock: Math.abs(item.qty) } },
          { session }
        );

        await StockMovement.create([{
          tenantId,
          productId: product._id,
          sku: product.sku,
          qty: Math.abs(item.qty),
          type: 'purchase',
          reason: `Received purchase ${purchase.reference || purchase._id}`,
          reference: purchase.reference || purchase._id,
          createdBy: req.user._id
        }], { session });
      }

      // Update purchase status
      purchase.status = 'received';
      await purchase.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.json({ success: true, data: purchase });
    } catch (err) {
      await session.abortTransaction().catch(()=>{});
      session.endSession();
      console.error('purchases.receive error', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};
