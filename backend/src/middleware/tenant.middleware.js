const Tenant = require("../models/Tenant.model");

async function tenantMiddleware(req, res, next) {
  try {
    const tenantId = req.headers["x-tenant-id"];

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant ID is required in x-tenant-id header",
      });
    }

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    if (!tenant.active) {
      return res.status(403).json({
        success: false,
        message: "Tenant is suspended",
      });
    }

    req.tenant = tenant;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { tenantMiddleware };
