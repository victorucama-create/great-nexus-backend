const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User.model");
const Tenant = require("../models/Tenant.model");
const LoginLog = require("../models/LoginLog.model");

const {
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendPasswordResetSuccessEmail,
  sendSuspiciousLoginEmail,
  sendWelcomeEmail,
} = require("../utils/sendEmail");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

module.exports = {

  // ===========================================================================
  // REGISTER
  // ===========================================================================
  async register(req, res) {
    try {
      const { name, email, password, companyName, country, currency } = req.body;

      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success: false, message: "Email já registado." });

      // Criar tenant
      const tenant = await Tenant.create({
        name: companyName,
        slug: companyName.toLowerCase().replace(/\s+/g, "-"),
        country,
        currency,
        plan: "starter",
        active: true,
      });

      const hashed = await bcrypt.hash(password, 10);

      const verificationToken = crypto.randomBytes(32).toString("hex");

      const user = await User.create({
        name,
        email,
        password: hashed,
        tenantId: tenant._id,
        role: "tenant_admin",
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await sendVerificationEmail(email, verificationToken);

      return res.json({
        success: true,
        message: "Conta criada! Verifique o email.",
        data: { user, tenant },
      });

    } catch (e) {
      console.error("REGISTER ERROR:", e);
      return res.status(500).json({ success: false, message: "Erro no registo" });
    }
  },

  // ===========================================================================
  // VERIFY EMAIL
  // ===========================================================================
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
      });

      if (!user)
        return res.status(400).json({ success: false, message: "Token inválido/expirado." });

      user.emailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      await user.save();

      await sendWelcomeEmail(user.email, user.name);

      return res.json({ success: true, message: "Email verificado com sucesso!" });

    } catch (e) {
      console.error("VERIFY ERROR:", e);
      return res.status(500).json({ success: false, message: "Erro ao verificar email." });
    }
  },

  // ===========================================================================
  // LOGIN
  // ===========================================================================
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user) return res.status(401).json({ success: false, message: "Credenciais inválidas." });

      if (!user.emailVerified)
        return res.status(403).json({ success: false, message: "Email não verificado." });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ success: false, message: "Password incorreta." });

      const tenant = user.role === "super_admin"
        ? null
        : await Tenant.findById(user.tenantId);

      if (tenant && !tenant.active)
        return res.status(403).json({ success: false, message: "Conta empresarial suspensa." });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await LoginLog.create({
        userId: user._id,
        tenantId: user.tenantId || null,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      user.lastLogin = new Date();
      user.loginCount += 1;
      user.lastLoginIP = req.ip;
      user.userAgent = req.headers["user-agent"];
      await user.save();

      const userClean = user.toObject();
      delete userClean.password;

      return res.json({
        success: true,
        message: "Login OK",
        data: { user: userClean, tenant, accessToken, refreshToken },
      });

    } catch (e) {
      console.error("LOGIN ERROR:", e);
      return res.status(500).json({ success: false, message: "Erro ao autenticar." });
    }
  },

  // ===========================================================================
  // RESEND VERIFICATION
  // ===========================================================================
  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ success: false, message: "Conta não encontrada." });

      if (user.emailVerified)
        return res.status(400).json({ success: false, message: "Email já verificado." });

      const token = crypto.randomBytes(32).toString("hex");
      user.emailVerificationToken = token;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      await sendVerificationEmail(email, token);

      return res.json({ success: true, message: "Novo email enviado!" });

    } catch (e) {
      console.error("RESEND ERROR:", e);
      return res.status(500).json({ success: false, message: "Erro ao reenviar email." });
    }
  },

  // ===========================================================================
  // FORGOT PASSWORD
  // ===========================================================================
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user)
        return res.json({ success: true, message: "Se existir, enviaremos instruções." });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.resetOTP = otp;
      user.resetOTPExpire = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      await sendForgotPasswordEmail(email, otp, user.name);

      return res.json({ success: true, message: "Código enviado ao email." });

    } catch (e) {
      console.error("FORGOT ERROR:", e);
      return res.status(500).json({ success: false, message: "Erro ao enviar OTP." });
    }
  },

  // ===========================================================================
  // RESET PASSWORD
  // ===========================================================================
  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;

      const user = await User.findOne({
        email,
        resetOTP: otp,
        resetOTPExpire: { $gt: Date.now() },
      });

      if (!user)
        return res.status(400).json({ success: false, message: "Código inválido/expirado." });

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetOTP = null;
      user.resetOTPExpire = null;
      await user.save();

      await sendPasswordResetSuccessEmail(email, user.name);

      return res.json({ success: true, message: "Password alterada com sucesso!" });

    } catch (e) {
      console.error("RESET ERROR:", e);
      return res.status(500).json({ success: false, message: "Erro ao redefinir password." });
    }
  },

  // ===========================================================================
  // REFRESH TOKEN
  // ===========================================================================
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      return res.json({
        success: true,
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      });

    } catch {
      return res.status(401).json({ success: false, message: "Refresh inválido" });
    }
  },

  // ===========================================================================
  // LOGOUT
  // ===========================================================================
  async logout(_, res) {
    return res.json({ success: true, message: "Sessão terminada com sucesso." });
  },

};
