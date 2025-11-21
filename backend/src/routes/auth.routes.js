// backend/src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/auth.controller");

// Public - auth
router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);

// Forgot / Reset
router.post("/auth/forgot-password", authCtrl.forgotPassword); // se implementado no controller
router.post("/auth/reset-password", authCtrl.resetPassword);   // se implementado no controller

// Verify email (GET by token) - /api/v1/auth/verify-email/:token
router.get("/verify-email/:token", authCtrl.verifyEmail);

// Resend verification
router.post("/resend-verification", authCtrl.resendVerification);

// Refresh token
router.post("/refresh", authCtrl.refreshToken);

// Logout (opcional)
router.post("/logout", authCtrl.logout);

module.exports = router;
