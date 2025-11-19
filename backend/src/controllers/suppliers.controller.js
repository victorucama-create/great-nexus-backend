const Supplier = require('../models/Supplier.model');

exports.list = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    const list = await Supplier.find({ tenantId }).sort({ name:1 });
    res.json({ success:true, data: list });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    const s = await Supplier.create({ ...req.body, tenantId, createdBy: req.user._id });
    res.json({ success:true, data: s });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    const updated = await Supplier.findOneAndUpdate({ _id:req.params.id, tenantId }, req.body, { new:true });
    res.json({ success:true, data: updated });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    const tenantId = req.tenant._id;
    await Supplier.findOneAndDelete({ _id:req.params.id, tenantId });
    res.json({ success:true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success:false, error: err.message }); }
};
