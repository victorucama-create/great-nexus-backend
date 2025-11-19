const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["super_admin", "tenant_admin", "manager", "staff", "viewer"],
      default: "staff",
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },

    phone: { type: String },
    country: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
