const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const Tenant = require("../models/Tenant.model");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const LoginLog = require("../models/LoginLog.model");
const nodemailer = require("nodemailer");

// =====================================
// EMAIL SENDER
// =====================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = {
  // ============================================================
  // REGISTER (TENANT + ADMIN)
  // ============================================================
  async register(req, res) {
    try {
      const { name, email, password, companyName, country, currency } = req.body;

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Email já está registado.",
        });
      }

      const tenant = await Tenant.create({
        name: companyName,
        slug: companyName.toLowerCase().replace(/\s+/g, "-"),
        country,
        currency,
        plan: "starter",
        active: true,
      });

      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashed,
        role: "tenant_admin",
        tenantId: tenant._id,
      });

      const userClean = user.toObject();
      delete userClean.password;

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return res.json({
        success: true,
        message: "Conta criada com sucesso!",
        data: { user: userClean, tenant, accessToken, refreshToken },
      });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  },

  // ============================================================
  // LOGIN
  // ============================================================
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Credenciais inválidas.",
        });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: "Password incorreta.",
        });
      }

      let tenant = null;
      if (user.role !== "super_admin") {
        tenant = await Tenant.findById(user.tenantId);

        if (!tenant || !tenant.active) {
          return res.status(403).json({
            success: false,
            message: "Conta empresarial suspensa.",
          });
        }
      }

      const userClean = user.toObject();
      delete userClean.password;

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await LoginLog.create({
        userId: user._id,
        tenantId: user.tenantId || null,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return res.json({
        success: true,
        message: "Login bem-sucedido!",
        data: { user: userClean, tenant, accessToken, refreshToken },
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  // ============================================================
  // FORGOT PASSWORD (GERAR OTP)
  // ============================================================
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Este email não existe no sistema.",
        });
      }

      // Criar OTP de 6 dígitos
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.resetOTP = otp;
      user.resetOTPExpire = Date.now() + 10 * 60 * 1000; // 10 min
      await user.save();

      // Enviar email com OTP
      await transporter.sendMail({
        from: `"Great Nexus" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Código de Recuperação de Password",
        html: `
          <h2>Recuperação de Password</h2>
          <p>O seu código OTP é:</p>
          <h1 style="font-size:32px; letter-spacing:4px;">${otp}</h1>
          <p>Este código expira em 10 minutos.</p>
        `,
      });

      return res.json({
        success: true,
        message: "Código OTP enviado para o email.",
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  // ============================================================
  // RESET PASSWORD (VALIDAR OTP)
  // ============================================================
  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;

      const user = await User.findOne({ email });

      if (
        !user ||
        user.resetOTP !== otp ||
        !user.resetOTPExpire ||
        user.resetOTPExpire < Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message: "OTP inválido ou expirado.",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetOTP = null;
      user.resetOTPExpire = null;

      await user.save();

      return res.json({
        success: true,
        message: "Password redefinida com sucesso!",
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  // ============================================================
  // VALIDAR TOKEN
  // ============================================================
  async validateToken(req, res) {
    res.json({
      success: true,
      message: "Token válido.",
      user: req.user,
      tenantId: req.tenantId || null,
    });
  },

  // ============================================================
  // REFRESH TOKEN
  // ============================================================
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token não fornecido.",
        });
      }

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);

      if (!user)
        return res.status(401).json({
          success: false,
          message: "Token inválido",
        });

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.json({
        success: true,
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      });
    } catch (e) {
      res.status(401).json({
        success: false,
        message: "Refresh token inválido.",
      });
    }
  },

  // ============================================================
  // LOGOUT
  // ============================================================
  async logout(req, res) {
    res.json({
      success: true,
      message: "Sessão terminada com sucesso.",
    });
  },
};
