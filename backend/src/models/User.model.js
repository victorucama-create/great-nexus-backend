const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // ============================
    // DADOS BÁSICOS
    // ============================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // Segurança extra (não retorna por padrão)
    },

    phone: {
      type: String,
      default: "",
    },

    country: {
      type: String,
      default: "",
    },

    // ============================
    // MULTI-TENANT
    // ============================
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },

    // ============================
    // ROLE SYSTEM
    // ============================
    role: {
      type: String,
      enum: ["super_admin", "tenant_admin", "manager", "staff", "viewer"],
      default: "staff",
    },

    // ============================
    // PASSWORD RESET (OTP)
    // ============================
    resetOTP: {
      type: String,
      default: null,
    },

    resetOTPExpire: {
      type: Date,
      default: null,
    },

    // ============================
    // STATUS & SEGURANÇA
    // ============================
    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    loginCount: {
      type: Number,
      default: 0,
    },

    // Guarda histórico de IPs para auditoria (opcional)
    lastLoginIP: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
