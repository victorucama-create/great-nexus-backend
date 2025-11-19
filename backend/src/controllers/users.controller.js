const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

module.exports = {
  // Create user inside tenant
  createUser: async (req, res) => {
    try {
      const { password, ...data } = req.body;

      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        ...data,
        password: hashed,
        tenant_id: req.tenantId,
      });

      res.json({ success: true, data: user });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  // List users within tenant
  listUsers: async (req, res) => {
    const users = await User.find({ tenant_id: req.tenantId });
    res.json({ success: true, data: users });
  },

  // Update user
  updateUser: async (req, res) => {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({ success: true, data: updated });
  },

  // Delete user
  deleteUser: async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User removed" });
  },

  // Change password
  changePassword: async (req, res) => {
    const { newPassword } = req.body;

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.userId, { password: hashed });

    res.json({ success: true, message: "Password updated" });
  },
};
