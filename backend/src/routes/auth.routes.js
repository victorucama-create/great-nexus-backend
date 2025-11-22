// backend/src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/auth.controller");
const rateLimit = require("express-rate-limit");

// Rate limiter para endpoints sensíveis
const authSensitiveLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 min
  max: 4,
  message: { success: false, message: "Muitas solicitações. Tente novamente mais tarde." }
});

// Registro & verificação
router.post("/register", authCtrl.register);

// Compatibilidade: token via param ou query
router.get("/verify/:token", authCtrl.verifyEmail);
router.get("/verify-email/:token", authCtrl.verifyEmail);

// Reenviar verificação (rate-limit)
router.post("/resend-verification", authSensitiveLimiter, authCtrl.resendVerification);

// Login/Logout
router.post("/login", authCtrl.login);
router.post("/logout", authCtrl.logout);

// Forgot/Reset
router.post("/forgot-password", authSensitiveLimiter, authCtrl.forgotPassword);
router.post("/reset-password", authCtrl.resetPassword);

// Token refresh
router.post("/refresh", authCtrl.refreshToken);

module.exports = router;
