function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado",
      });
    }
    next();
  };
}

module.exports = { requireRole };
