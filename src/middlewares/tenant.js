module.exports.tenantFilter = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    req.tenantFilter = {};
  } else if (req.user && req.user.tenantId) {
    req.tenantFilter = { tenantId: req.user.tenantId };
  } else {
    req.tenantFilter = {};
  }
  next();
};
