// ======================================================
// MODEL: LoginLog
// ======================================================
// Este modelo armazena registros de autenticação
// para auditoria, segurança, analytics e antifraude.
// ======================================================

const mongoose = require("mongoose");

const LoginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null, // super admins não têm tenant
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    success: {
      type: Boolean,
      required: true,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    deviceInfo: {
      os: { type: String, default: null },
      browser: { type: String, default: null },
      brand: { type: String, default: null },
    },

    location: {
      country: { type: String, default: null },
      city: { type: String, default: null },
      region: { type: String, default: null },
      lat: { type: Number, default: null },
      lon: { type: Number, default: null },
    },

    reason: {
      type: String, // exemplo: "Invalid password", "Email not found"
      default: null,
    },

    // Para segurança avançada:
    suspicious: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model("LoginLog", LoginLogSchema);
