// backend/src/middleware/rateLimit.middleware.js
const rateLimit = require("express-rate-limit");

// Limite para endpoints sensíveis (forgot-password, resend-verification)
const authSensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 6, // max 6 pedidos por IP por janela
  message: {
    success: false,
    message: "Muitas requisições. Tente novamente mais tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite geral para API (mais permissivo)
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 200,
  message: {
    success: false,
    message: "Muitas requisições. Tente novamente mais tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authSensitiveLimiter,
  generalLimiter,
};
