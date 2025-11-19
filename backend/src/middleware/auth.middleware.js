const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Tenant = require("../models/Tenant.model");

module.exports = {
  // ======================================================
  // VERIFICAR ACCESS TOKEN (Obrigatório em rotas protegidas)
  // ======================================================
  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers["authorization"];

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Token não fornecido",
        });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
        });
      }

      // Validar token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar utilizador
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
        });
      }

      // Se for tenant admin, verificar tenant
      let tenant = null;

      if (user.role !== "super_admin") {
        tenant = await Tenant.findById(user.tenantId);

        if (!tenant) {
          return res.status(403).json({
            success: false,
            message: "Empresa não encontrada",
          });
        }

        if (!tenant.active) {
          return res.status(403).json({
            success: false,
            message: "Empresa suspensa",
          });
        }
      }

      req.user = user;
      req.tenant = tenant;

      next();
    } catch (error) {
      console.error("AUTH ERROR:", error);

      return res.status(401).json({
        success: false,
        message: "Token inválido ou expirado",
      });
    }
  },

  // ======================================================
  // REFRESH TOKEN
  // ======================================================
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token não fornecido",
        });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      const newAccessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Refresh token inválido ou expirado",
      });
    }
  },
};
