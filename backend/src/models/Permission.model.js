const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    module: { type: String, required: true }, 
    // Ex: "inventory", "crm", "hr", "mrp", "accounting", "b2b"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", PermissionSchema);
