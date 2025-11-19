module.exports = {
  // ======================================================
  // PERMITIR APENAS SUPER ADMIN
  // ======================================================
  requireSuperAdmin(req, res, next) {
    if (!req.user || req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Acesso restrito ao Super Admin",
      });
    }

    next();
  },

  // ======================================================
  // PERMITIR APENAS ADMINISTRADOR DO TENANT
  // ======================================================
  requireTenantAdmin(req, res, next) {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    if (
      req.user.role !== "tenant_admin" &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Acesso restrito ao Administrador da Empresa",
      });
    }

    next();
  },

  // ======================================================
  // PERMITIR APENAS UTILIZADORES NORMAIS
  // ======================================================
  requireStandardUser(req, res, next) {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    if (req.user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Apenas usuários normais podem acessar esta rota",
      });
    }

    next();
  },

  // ======================================================
  // RBAC AVANÇADO POR PERMISSÕES
  // (Para o futuro — permite definir permissões específicas)
  // ======================================================
  requirePermission(permissionName) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: "Usuário não autenticado",
        });
      }

      // Super Admin sempre tem acesso
      if (req.user.role === "super_admin") {
        return next();
      }

      // Verifica lista de permissões no utilizador
      if (
        !req.user.permissions ||
        !req.user.permissions.includes(permissionName)
      ) {
        return res.status(403).json({
          success: false,
          message: `Permissão '${permissionName}' não autorizada`,
        });
      }

      next();
    };
  },
};
