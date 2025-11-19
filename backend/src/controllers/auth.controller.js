const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const Tenant = require("../models/Tenant.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt");

module.exports = {
  // ============================
  // REGISTER
  // ============================
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

      // Check if user already exists
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email já registado",
        });
      }

      // Create Tenant
      const tenant = await Tenant.create({
        name: companyName,
        slug: companyName.toLowerCase().replace(/\s+/g, "-"),
        country,
        currency,
        plan: "starter",
      });

      // Create User
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashed,
        role: "tenant_admin",
        tenantId: tenant._id,
      });

      return res.json({
        success: true,
        message: "Conta criada com sucesso",
        data: {
          user,
          tenant,
          accessToken: generateAccessToken(user),
          refreshToken: generateRefreshToken(user),
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // ============================
  // LOGIN
  // ============================
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Credenciais inválidas",
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({
          success: false,
          message: "Password incorreta",
        });
      }

      return res.json({
        success: true,
        message: "Login bem-sucedido",
        data: {
          user,
          tenantId: user.tenantId,
          accessToken: generateAccessToken(user),
          refreshToken: generateRefreshToken(user),
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
