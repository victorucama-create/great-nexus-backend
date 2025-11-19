// backend/src/controllers/inventory.controller.js
// Controller para movimentos de stock, transferências e listagens.
// Requer: Product.model, StockMovement.model, Warehouse.model
const mongoose = require('mongoose');
const Product = require('../models/Product.model');
const StockMovement = require('../models/StockMovement.model');
const Warehouse = require('../models/Warehouse.model');

function normalizeTenant(req) {
  // Tenant injected by tenantMiddleware
  return (req.tenant && req.tenant._id) || req.user.tenantId;
}

module.exports = {
  /**
   * createMovement
   * body: { productId, qty, type, warehouseFrom, warehouseTo, reason, reference }
   * type: in | out | adjustment | transfer | purchase | sale
   */
  async createMovement(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const tenantId = normalizeTenant(req);
      const { productId, qty, type, warehouseFrom, warehouseTo, reason, reference } = req.body;

      if (!productId || typeof qty !== 'number') {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ success: false, error: 'productId and qty (number) are required' });
      }

      const allowed = ['in','out','adjustment','transfer','purchase','sale'];
      if (!allowed.includes(type)) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ success: false, error: 'Invalid movement type' });
      }

      // Load product and check tenant
      const product = await Product.findOne({ _id: productId, tenantId }).session(session);
      if (!product) {
        await session.abortTransaction(); session.endSession();
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      // Determine delta (positive for IN, negative for OUT)
      let delta = 0;
      if (type === 'in' || type === 'purchase') delta = Math.abs(qty);
      else if (type === 'out' || type === 'sale') delta = -Math.abs(qty);
      else if (type === 'adjustment') delta = qty; // adjustment can be +/- as provided
      else if (type === 'transfer') {
        // For transfer we create a single record with qty positive for target or negative depending on warehouse
        delta = -Math.abs(qty); // initial reduce; creation of positive movement handled when creating transfer movement(s)
      }

      // If decreasing stock ensure enough quantity exists
      if (delta < 0) {
        // ensure product.stock >= -delta
        if ((product.stock || 0) + delta < 0) {
          await session.abortTransaction(); session.endSession();
          return res.status(400).json({ success: false, error: 'Insufficient stock' });
        }
      }

      // Update cached stock atomically
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, tenantId },
        { $inc: { stock: delta }, $set: { updatedBy: req.user._id } },
        { new: true, session }
      );

      // Create stock movement record
      const movementPayload = {
        tenantId,
        productId,
        sku: product.sku,
        qty: delta,
        type,
        reason: reason || null,
        warehouseFrom: warehouseFrom || null,
        warehouseTo: warehouseTo || null,
        reference: reference || null,
        createdBy: req.user._id
      };

      const movement = await StockMovement.create([movementPayload], { session });

      // For transfer, also create compensating IN movement if warehouseTo provided
      if (type === 'transfer' && warehouseTo) {
        // Increase stock same qty (logical system might track per warehouse; here we maintain global stock)
        const compensating = {
          tenantId,
          productId,
          sku: product.sku,
          qty: Math.abs(qty),
          type: 'transfer',
          reason: `Transfer to ${warehouseTo}`,
          warehouseFrom: warehouseFrom || null,
          warehouseTo,
          reference: reference || null,
          createdBy: req.user._id
        };
        // Adjust global stock back (transfer between warehouses shouldn't change global stock)
        // We already decreased global stock above; so add back
        await Product.findOneAndUpdate(
          { _id: productId, tenantId },
          { $inc: { stock: Math.abs(qty) } },
          { session }
        );
        await StockMovement.create([compensating], { session });
      }

      await session.commitTransaction();
      session.endSession();

      return res.json({ success: true, data: movement[0] });
    } catch (err) {
      await session.abortTransaction().catch(()=>{});
      session.endSession();
      console.error('createMovement error', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * listMovements
   * query params: productId, type, startDate, endDate, page, limit
   */
  async listMovements(req, res) {
    try {
      const tenantId = normalizeTenant(req);
      const q = { tenantId };

      if (req.query.productId) q.productId = req.query.productId;
      if (req.query.type) q.type = req.query.type;
      if (req.query.sku) q.sku = req.query.sku;
      if (req.query.startDate || req.query.endDate) {
        q.createdAt = {};
        if (req.query.startDate) q.createdAt.$gte = new Date(req.query.startDate);
        if (req.query.endDate) q.createdAt.$lte = new Date(req.query.endDate);
      }

      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const limit = Math.min(100, parseInt(req.query.limit || '50', 10));
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        StockMovement.find(q)
          .populate('productId', 'name sku')
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        StockMovement.countDocuments(q)
      ]);

      return res.json({ success: true, data: items, meta: { page, limit, total } });
    } catch (err) {
      console.error('listMovements error', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * transfer between warehouses
   * body: { productId, qty, fromWarehouse, toWarehouse, reference }
   * This uses createMovement semantics and ensures atomicity
   */
  async transfer(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const tenantId = normalizeTenant(req);
      const { productId, qty, fromWarehouse, toWarehouse, reference } = req.body;

      if (!productId || !qty || !fromWarehouse || !toWarehouse) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ success: false, error: 'productId, qty, fromWarehouse and toWarehouse are required' });
      }

      const product = await Product.findOne({ _id: productId, tenantId }).session(session);
      if (!product) {
        await session.abortTransaction(); session.endSession();
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      // Check stock
      if ((product.stock || 0) < qty) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ success: false, error: 'Insufficient stock to transfer' });
      }

      // Create OUT movement
      const outMovement = {
        tenantId,
        productId,
        sku: product.sku,
        qty: -Math.abs(qty),
        type: 'transfer',
        reason: `Transfer out to ${toWarehouse}`,
        warehouseFrom: fromWarehouse,
        warehouseTo: toWarehouse,
        reference: reference || null,
        createdBy: req.user._id
      };

      // Create IN movement
      const inMovement = {
        tenantId,
        productId,
        sku: product.sku,
        qty: Math.abs(qty),
        type: 'transfer',
        reason: `Transfer in from ${fromWarehouse}`,
        warehouseFrom: fromWarehouse,
        warehouseTo,
        reference: reference || null,
        createdBy: req.user._id
      };

      // Adjust global stock net zero (out then in cancels out), but we keep records
      await StockMovement.create([outMovement, inMovement], { session });

      // No change to global cached stock (transfer between warehouses)
      await session.commitTransaction();
      session.endSession();

      return res.json({ success: true, data: { out: outMovement, in: inMovement } });
    } catch (err) {
      await session.abortTransaction().catch(()=>{});
      session.endSession();
      console.error('transfer error', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};
