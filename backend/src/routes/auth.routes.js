const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/auth.controller");

// ============================================================
// REGISTER + EMAIL VERIFICATION
// ============================================================
router.post("/register", authCtrl.register);

// Verificar email (via /verify-email?token=123)
router.get("/verify-email/:token", authCtrl.verifyEmail);

// Suporte legado: /verify/:token
router.get("/verify/:token", authCtrl.verifyEmail);

// Reenviar link de verificação
router.post("/resend-verification", authCtrl.resendVerification);

// ============================================================
// LOGIN / LOGOUT
// ============================================================
router.post("/login", authCtrl.login);
router.post("/logout", authCtrl.logout);

// ============================================================
// PASSWORD RESET (OTP)
// ============================================================
router.post("/forgot-password", authCtrl.forgotPassword);
router.post("/reset-password", authCtrl.resetPassword);

// ============================================================
// TOKEN REFRESH
// ============================================================
router.post("/refresh", authCtrl.refreshToken);

module.exports = router;
