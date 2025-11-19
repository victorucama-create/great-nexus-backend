const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const Tenant = require("../models/Tenant.model");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const LoginLog = require("../models/LoginLog.model");

module.exports = {
  // ============================================================
  // REGISTER (CRIAR TENANT + ADMIN)
  // ============================================================
  async register(req, res) {
    try {
      const {
        name,
        email,
        password,
        companyName,
        country,
        currency,
      } = req.body;

      const exists = await User.findOne({ email });
      if (exists) {
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

      // Criar utilizador Admin
      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashed,
        role: "tenant_admin",
        tenantId: tenant._id,
      });

      // Remover password do retorno
      const userClean = user.toObject();
      delete userClean.password;

      // Tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.json({
        success: true,
        message: "Conta criada com sucesso!",
        data: {
          user: userClean,
          tenant,
          accessToken,
          refreshToken,
        },
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
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

      // Verificar password
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: "Password incorreta.",
        });
      }

      // Verificar status do tenant
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

      // Remover password do retorno
      const userClean = user.toObject();
      delete userClean.password;

      // Tokens JWT
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Registrar log de login
      await LoginLog.create({
        userId: user._id,
        tenantId: user.tenantId || null,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return res.json({
        success: true,
        message: "Login bem-sucedido!",
        data: {
          user: userClean,
          tenant,
          accessToken,
          refreshToken,
        },
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

      // Buscar user
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
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
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
