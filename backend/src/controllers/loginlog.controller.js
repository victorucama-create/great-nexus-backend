// ======================================================
// CONTROLLER: Login Log
// ======================================================
// Gestão de logs de autenticação para auditoria e segurança
// ======================================================

const LoginLog = require("../models/LoginLog.model");
const User = require("../models/User.model");
const json2csv = require("json2csv").Parser;

// Detecta acessos suspeitos
function isSuspicious(log) {
  // Pode ser expandido mais tarde para IA
  if (!log.success) return true; // Falhas são sempre suspeitas

  if (log.location && log.location.country && log.location.country !== "MZ") {
    return true; // acessos de outros países
  }

  if (!log.ipAddress) return true;

  return false;
}

module.exports = {
  // ======================================================
  // CRIA AUTOMATICAMENTE LOG DE LOGIN
  // ======================================================
  async createLog({
    user,
    email,
    success,
    ip,
    userAgent,
    deviceInfo,
    location,
    reason,
  }) {
    try {
      const log = await LoginLog.create({
        userId: user ? user._id : null,
        tenantId: user ? user.tenantId : null,
        email,
        success,
        ipAddress: ip,
        userAgent: userAgent || null,
        deviceInfo: deviceInfo || {},
        location: location || {},
        reason: reason || null,
        suspicious: success === false ? true : isSuspicious({ location }),
      });

      return log;
    } catch (error) {
      console.error("Erro ao gravar login log:", error);
      return null;
    }
  },

  // ======================================================
  // LISTAR LOGS (SUPER ADMIN)
  // ======================================================
  async listAll(req, res) {
    try {
      const logs = await LoginLog.find()
        .populate("userId", "name email")
        .populate("tenantId", "name")
        .sort({ createdAt: -1 });

      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // ======================================================
  // LISTAR LOGS POR TENANT
  // (Apenas admin do tenant ou super admin)
  // ======================================================
  async listByTenant(req, res) {
    try {
      const tenantId = req.user.tenantId;

      const logs = await LoginLog.find({ tenantId })
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // ======================================================
  // LISTAR LOGS DE UM UTILIZADOR
  // ======================================================
  async listByUser(req, res) {
    try {
      const { id } = req.params;

      const logs = await LoginLog.find({ userId: id })
        .sort({ createdAt: -1 });

      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // ======================================================
  // FILTRO AVANÇADO
  // /filter?success=true&country=MZ&ip=127.0.0.1
  // ======================================================
  async filter(req, res) {
    try {
      const query = {};
      const {
        success,
        email,
        ip,
        country,
        suspicious,
        startDate,
        endDate,
      } = req.query;

      if (success !== undefined) query.success = success === "true";
      if (email) query.email = email;
      if (ip) query.ipAddress = ip;
      if (suspicious !== undefined)
        query.suspicious = suspicious === "true";
      if (country)
        query["location.country"] = country;

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const logs = await LoginLog.find(query)
        .populate("userId", "name email")
        .populate("tenantId", "name")
        .sort({ createdAt: -1 });

      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // ======================================================
  // EXPORTAR CSV
  // ======================================================
  async exportCSV(req, res) {
    try {
      const logs = await LoginLog.find().lean();

      const fields = [
        "email",
        "success",
        "ipAddress",
        "userAgent",
        "location.country",
        "location.city",
        "reason",
        "createdAt",
      ];

      const csv = new json2csv({ fields }).parse(logs);

      res.header("Content-Type", "text/csv");
      res.attachment("login_logs.csv");
      return res.send(csv);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // ======================================================
  // EXPORTAR JSON
  // ======================================================
  async exportJSON(req, res) {
    try {
      const logs = await LoginLog.find().lean();

      res.header("Content-Type", "application/json");
      res.attachment("login_logs.json");
      return res.send(JSON.stringify(logs, null, 2));
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
