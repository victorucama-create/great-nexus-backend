const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth.controller");

// AUTH
router.post("/register", auth.register);
router.get("/verify/:token", auth.verifyEmail);
router.post("/resend-verification", auth.resendVerification);

// LOGIN / LOGOUT
router.post("/login", auth.login);
router.post("/logout", auth.logout);

// PASSWORD RESET
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);

// TOKENS
router.post("/refresh", auth.refreshToken);

module.exports = router;
