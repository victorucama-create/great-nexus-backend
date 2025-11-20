const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/auth.controller");

// =========================================================
// AUTH - ROTAS PÚBLICAS
// =========================================================

// Criar conta (Tenant + Admin)
router.post("/register", authCtrl.register);

// Login (gera access + refresh token)
router.post("/login", authCtrl.login);

// Recuperar password (envia OTP para email)
router.post("/forgot-password", authCtrl.forgotPassword);

// Reset password com OTP
router.post("/reset-password", authCtrl.resetPassword);

// Refresh token
router.post("/refresh", authCtrl.refresh);

// =========================================================
// ROTAS PROTEGIDAS
// =========================================================

// Validar token (apenas para manter sessão ativa)
router.get("/validate", authCtrl.validateToken);

// Logout (opcional, mas mantido por estrutura)
router.post("/logout", authCtrl.logout);

module.exports = router;
