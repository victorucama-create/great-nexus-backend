// backend/src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User.model");
const Tenant = require("../models/Tenant.model");
const LoginLog = require("../models/LoginLog.model"); // opcional
const {
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendPasswordResetSuccessEmail,
  sendWelcomeEmail,
  sendSuspiciousLoginEmail,
} = require("../utils/sendEmail");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt");

module.exports = {
  // Register: creates tenant + user + send verification
  async register(req, res) {
    try {
      const { name, email, password, companyName, country, currency } = req.body;
      if (!email || !password || !companyName) {
        return res.status(400).json({ success:false, message: "Dados incompletos" });
      }

      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success:false, message: "Email já registado" });

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
      const verificationExpires = new Date(Date.now() + 24*60*60*1000);

      const user = await User.create({
        name,
        email,
        password: hashed,
        tenantId: tenant._id,
        role: "tenant_admin",
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      });

      await sendVerificationEmail(email, verificationToken, name);
      await sendWelcomeEmail(email, name); // optional: welcome also

      const userClean = user.toObject();
      delete userClean.password;

      return res.json({ success:true, message: "Conta criada. Verifique seu email.", data: { user: userClean, tenant } });
    } catch (err) {
      console.error("REGISTER ERR:", err);
      return res.status(500).json({ success:false, message: "Erro ao criar conta" });
    }
  },

  // Verify email
  async verifyEmail(req, res) {
    try {
      const token = req.params.token || req.query.token;
      if (!token) return res.status(400).json({ success:false, message: "Token faltando" });

      const user = await User.findOne({ emailVerificationToken: token, emailVerificationExpires: { $gt: Date.now() } });
      if (!user) return res.status(400).json({ success:false, message: "Token inválido ou expirado" });

      user.emailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      await user.save();

      return res.json({ success:true, message: "Email verificado com sucesso" });
    } catch (err) {
      console.error("VERIFY ERR:", err);
      return res.status(500).json({ success:false, message: "Erro ao verificar email" });
    }
  },

  // Resend verification
  async resendVerification(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success:false, message: "Email obrigatório" });

      const user = await User.findOne({ email });
      if (!user) return res.json({ success:true, message: "Se a conta existir, enviámos um email" }); // avoid user enumeration

      if (user.emailVerified) return res.status(400).json({ success:false, message: "Email já verificado" });

      const token = crypto.randomBytes(32).toString("hex");
      user.emailVerificationToken = token;
      user.emailVerificationExpires = new Date(Date.now() + 24*60*60*1000);
      await user.save();

      await sendVerificationEmail(email, token, user.name);
      return res.json({ success:true, message: "Se a conta existir, enviámos um email" });
    } catch (err) {
      console.error("RESEND ERR:", err);
      return res.status(500).json({ success:false, message: "Erro ao reenviar email" });
    }
  },

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user) return res.status(401).json({ success:false, message: "Credenciais inválidas" });

      if (!user.emailVerified) return res.status(403).json({ success:false, message: "Email não verificado" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ success:false, message: "Credenciais inválidas" });

      // Check tenant
      let tenant = null;
      if (user.role !== "super_admin") {
        tenant = await Tenant.findById(user.tenantId);
        if (!tenant || !tenant.active) return res.status(403).json({ success:false, message: "Tenant suspenso" });
      }

      // tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // update stats
      user.lastLogin = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLoginIP = req.ip;
      user.userAgent = req.headers["user-agent"];
      await user.save();

      // log
      if (LoginLog) {
        try { await LoginLog.create({ userId: user._id, tenantId: user.tenantId, ip: req.ip, userAgent: req.headers["user-agent"] }); } catch(e){/* ignore */}
      }

      const userClean = user.toObject();
      delete userClean.password;

      return res.json({ success:true, message: "Login efetuado", data: { user: userClean, tenant, accessToken, refreshToken } });
    } catch (err) {
      console.error("LOGIN ERR:", err);
      return res.status(500).json({ success:false, message: "Erro ao fazer login" });
    }
  },

  // Forgot password (generate OTP saved on user)
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success:false, message: "Email obrigatório" });

      const user = await User.findOne({ email });
      if (!user) return res.json({ success:true, message: "Se a conta existir, enviámos instruções" });

      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
      user.resetOTP = otp;
      user.resetOTPExpire = new Date(Date.now() + 15*60*1000);
      await user.save();

      await sendForgotPasswordEmail(email, otp, user.name);
      return res.json({ success:true, message: "Se a conta existir, enviámos instruções" });
    } catch (err) {
      console.error("FORGOT ERR:", err);
      return res.status(500).json({ success:false, message: "Erro ao processar pedido" });
    }
  },

  // Reset password (using OTP)
  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) return res.status(400).json({ success:false, message: "Dados incompletos" });

      const user = await User.findOne({ email }).select("+password +resetOTP +resetOTPExpire");
      if (!user) return res.status(400).json({ success:false, message: "Dados inválidos" });

      if (!user.resetOTP || user.resetOTP !== otp || !user.resetOTPExpire || user.resetOTPExpire < Date.now()) {
        return res.status(400).json({ success:false, message: "OTP inválido ou expirado" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetOTP = null;
      user.resetOTPExpire = null;
      await user.save();

      await sendPasswordResetSuccessEmail(email, user.name);

      return res.json({ success:true, message: "Password redefinida com sucesso" });
    } catch (err) {
      console.error("RESET ERR:", err);
      return res.status(500).json({ success:false, message: "Erro ao redefinir password" });
    }
  },

  // Refresh
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ success:false, message: "Refresh token ausente" });

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ success:false, message: "Token inválido" });

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      return res.json({ success:true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
    } catch (err) {
      console.error("REFRESH ERR:", err);
      return res.status(401).json({ success:false, message: "Refresh token inválido" });
    }
  },

  // Logout
  async logout(req, res) {
    return res.json({ success:true, message: "Sessão encerrada" });
  },
};
