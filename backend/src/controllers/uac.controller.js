const Role = require("../models/Role.model");
const Permission = require("../models/Permission.model");
const UserRole = require("../models/UserRole.model");
const RolePermission = require("../models/RolePermission.model");
const User = require("../models/User.model");

module.exports = {
  // ============================================
  // CRIAR PERMISSÃO
  // ============================================
  async createPermission(req, res) {
    try {
      const { name, description, module } = req.body;

      const permission = await Permission.create({
        name,
        description,
        module,
      });

      res.json({ success: true, data: permission });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ============================================
  // CRIAR PAPEL / ROLE
  // ============================================
  async createRole(req, res) {
    try {
      const { name, description, tenantScope } = req.body;

      const role = await Role.create({
        name,
        description,
        tenantScope,
      });

      res.json({ success: true, data: role });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ============================================
  // ATRIBUIR ROLE A USUÁRIO
  // ============================================
  async assignRole(req, res) {
    try {
      const { userId, roleId } = req.body;

      const link = await UserRole.create({
        userId,
        roleId,
        tenantId: req.user.tenantId,
      });

      res.json({ success: true, data: link });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ============================================
  // ATRIBUIR PERMISSÃO A ROLE
  // ============================================
  async assignPermission(req, res) {
    try {
      const { roleId, permissionId } = req.body;

      const link = await RolePermission.create({
        roleId,
        permissionId
      });

      res.json({ success: true, data: link });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ============================================
  // LISTAR PERMISSÕES DE UM USUÁRIO
  // ============================================
  async getUserPermissions(req, res) {
    try {
      const userId = req.params.id;

      const roles = await UserRole.find({ userId }).populate("roleId");

      const permissions = await RolePermission.find({
        roleId: { $in: roles.map(r => r.roleId._id) }
      }).populate("permissionId");

      res.json({
        success: true,
        data: {
          roles,
          permissions: permissions.map(p => p.permissionId)
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
