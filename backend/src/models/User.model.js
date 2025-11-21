const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // ======================================================
    // 🔹 DADOS BÁSICOS
    // ======================================================
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
      select: false, // Segurança — nunca retorna por padrão
    },

    phone: {
      type: String,
      default: "",
    },

    country: {
      type: String,
      default: "",
    },

    // ======================================================
    // 🔹 MULTI-TENANT
    // ======================================================
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },

    // ======================================================
    // 🔹 ROLE SYSTEM
    // super_admin → acesso total
    // tenant_admin → dono da empresa
    // manager → gestor
    // staff → funcionário
    // viewer → só leitura
    // ======================================================
    role: {
      type: String,
      enum: ["super_admin", "tenant_admin", "manager", "staff", "viewer"],
      default: "staff",
    },

    // ======================================================
    // 🔹 EMAIL VERIFICATION (NOVO)
    // ======================================================
    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    // ======================================================
    // 🔹 PASSWORD RESET (OTP)
    // ======================================================
    resetOTP: {
      type: String,
      default: null,
    },

    resetOTPExpire: {
      type: Date,
      default: null,
    },

    // ======================================================
    // 🔹 SEGURANÇA & STATUS
    // ======================================================
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

    lastLoginIP: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    // ======================================================
    // 🔹 FUTURO: AUTENTICAÇÃO DE 2 FATORES (se quiser ativar)
    // ======================================================
    mfaEnabled: {
      type: Boolean,
      default: false,
    },

    mfaSecret: {
      type: String,
      default: null,
      select: false,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
