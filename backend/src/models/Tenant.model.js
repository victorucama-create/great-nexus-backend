const mongoose = require("mongoose");

const TenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    country: { type: String, required: true },
    currency: { type: String, required: true },

    plan: {
      type: String,
      enum: [
        "starter",
        "sales",
        "sales_inventory",
        "erp_full",
        "erp_mrp",
        "erp_crm",
        "erp_hr",
        "full_suite",
      ],
      default: "starter",
    },

    active: { type: Boolean, default: true },

    // SEO settings (optional)
    seo_enabled: { type: Boolean, default: false },
    seo_keywords: { type: [String], default: [] },

    // B2B config
    allow_b2b: { type: Boolean, default: false },

    // Fintech config
    mola_enabled: { type: Boolean, default: true },

    // Limits
    user_limit: { type: Number, default: 5 },
    product_limit: { type: Number, default: 100 },

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", TenantSchema);
