const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/auth.controller");

// já devem existir register/login
router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);

// Forgot password & Reset
router.post("/forgot-password", authCtrl.forgotPassword);
router.post("/reset-password", authCtrl.resetPassword);

// Refresh token (se existir)
router.post("/refresh", authCtrl.refreshToken);

module.exports = router;
