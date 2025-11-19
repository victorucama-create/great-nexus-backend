const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    tenantScope: {
      type: Boolean,
      default: true, // super admin tem scope = false (global)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", RoleSchema);
