const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// ============================
// Helper — Load HTML Template
// ============================
function loadTemplate(templateName, vars = {}) {
  const filePath = path.join(__dirname, "..", "templates", `${templateName}.html`);
  let html = fs.readFileSync(filePath, "utf8");

  Object.keys(vars).forEach((key) => {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), vars[key]);
  });

  return html;
}

// ============================
// Transporter
// ============================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: Number(process.env.EMAIL_SECURE) === 1,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ============================
// SEND FUNCTIONS
// ============================

async function sendVerificationEmail(to, token) {
  const VERIFY_URL = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Confirmação de Email — Great Nexus",
    html: loadTemplate("welcome", {
      VERIFY_URL,
      APP_NAME: "Great Nexus",
      YEAR: new Date().getFullYear(),
    }),
  });
}

async function sendForgotPasswordEmail(to, otp, name) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Código de Recuperação — Great Nexus",
    html: loadTemplate("forgot-password", {
      APP_NAME: "Great Nexus",
      USER_NAME: name,
      RESET_URL: "",
      EXPIRE_HUMAN: "15 minutos",
      SUPPORT_EMAIL: "support@greatnexus.com",
      YEAR: new Date().getFullYear(),
    }),
  });
}

async function sendPasswordResetSuccessEmail(to, name) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Password Alterada — Great Nexus",
    html: loadTemplate("reset-password", {
      APP_NAME: "Great Nexus",
      USER_NAME: name,
      SUPPORT_EMAIL: "support@greatnexus.com",
      YEAR: new Date().getFullYear(),
    }),
  });
}

async function sendWelcomeEmail(to, name) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Bem-vindo ao Great Nexus!",
    html: loadTemplate("welcome", {
      APP_NAME: "Great Nexus",
      USER_NAME: name,
      DASHBOARD_URL: `${process.env.FRONTEND_URL}/dashboard`,
      SUPPORT_EMAIL: "support@greatnexus.com",
      YEAR: new Date().getFullYear(),
    }),
  });
}

async function sendSuspiciousLoginEmail(to, vars) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Aviso: Tentativa de acesso suspeita",
    html: loadTemplate("login-suspect", {
      ...vars,
      APP_NAME: "Great Nexus",
      YEAR: new Date().getFullYear(),
    }),
  });
}

module.exports = {
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendPasswordResetSuccessEmail,
  sendSuspiciousLoginEmail,
  sendWelcomeEmail,
};
