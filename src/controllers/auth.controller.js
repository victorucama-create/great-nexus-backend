const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User.model");
const Tenant = require("../models/Tenant.model");
const LoginLog = require("../models/LoginLog.model");

const { sendVerificationEmail } = require("../utils/sendEmail");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

module.exports = {
  // ===========================================================================
  // REGISTER → Cria utilizador + envia email de verificação
  // ===========================================================================
  async register(req, res) {
    try {
      const { name, email, password, companyName, country, currency } = req.body;

      // Verificar se já existe
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email já está registado.",
        });
      }

      // Criar tenant
      const tenant = await Tenant.create({
        name: companyName,
        slug: companyName.toLowerCase().replace(/\s+/g, "-"),
        country,
        currency,
        plan: "starter",
        active: true,
      });

      // Criar utilizador admin
      const hashed = await bcrypt.hash(password, 10);

      // Criar token de verificação
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      const user = await User.create({
        name,
        email,
        password: hashed,
        tenantId: tenant._id,
        role: "tenant_admin",
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      });

      // Enviar email de confirmação
      await sendVerificationEmail(user.email, verificationToken);

      // Não retornar password
      const userClean = user.toObject();
      delete userClean.password;

      return res.json({
        success: true,
        message: "Conta criada! Verifique o seu email antes de entrar.",
        data: {
          user: userClean,
          tenant,
        },
      });
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Erro ao criar conta.",
      });
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

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Token inválido ou expirado.",
        });
      }

      user.emailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      await user.save();

      return res.json({
        success: true,
        message: "Email verificado com sucesso!",
      });
    } catch (err) {
      console.error("VERIFY EMAIL ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Erro ao verificar email.",
      });
    }
  },

  // ===========================================================================
  // LOGIN
  // ===========================================================================
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Credenciais inválidas.",
        });
      }

      // Verificar email
      if (!user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email ainda não verificado. Verifique seu email.",
        });
      }

      // Verificar password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Password incorreta.",
        });
      }

      // Verificar tenant ativo
      let tenant = null;
      if (user.role !== "super_admin") {
        tenant = await Tenant.findById(user.tenantId);
        if (!tenant || !tenant.active) {
          return res.status(403).json({
            success: false,
            message: "A conta da empresa está suspensa.",
          });
        }
      }

      // JWT Tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Atualizar estatísticas
      user.lastLogin = new Date();
      user.loginCount += 1;
      user.lastLoginIP = req.ip;
      user.userAgent = req.headers["user-agent"];
      await user.save();

      await LoginLog.create({
        userId: user._id,
        tenantId: user.tenantId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      const userClean = user.toObject();
      delete userClean.password;

      return res.json({
        success: true,
        message: "Login efetuado com sucesso!",
        data: {
          user: userClean,
          tenant,
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Erro ao fazer login.",
      });
    }
  },

  // ===========================================================================
  // RESEND VERIFICATION
  // ===========================================================================
  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Nenhuma conta encontrada com este email.",
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          success: false,
          message: "Este email já foi verificado.",
        });
      }

      // gerar novo token
      const token = crypto.randomBytes(32).toString("hex");

      user.emailVerificationToken = token;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      await sendVerificationEmail(user.email, token);

      return res.json({
        success: true,
        message: "Novo email de verificação enviado.",
      });
    } catch (err) {
      console.error("RESEND EMAIL ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Erro ao reenviar email.",
      });
    }
  },

  // ===========================================================================
  // REFRESH TOKEN
  // ===========================================================================
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken)
        return res.status(400).json({
          success: false,
          message: "Refresh token não fornecido.",
        });

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);

      if (!user)
        return res.status(401).json({
          success: false,
          message: "Token inválido.",
        });

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Refresh token inválido.",
      });
    }
  },

  // ===========================================================================
  // LOGOUT
  // ===========================================================================
  async logout(req, res) {
    return res.json({
      success: true,
      message: "Sessão terminada com sucesso.",
    });
  },
};
