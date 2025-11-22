const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// ============================================================
// LOAD EMAIL TEMPLATE (HTML)
// ============================================================
function loadTemplate(templateName, vars = {}) {
  const filePath = path.join(
    __dirname,
    "..",
    "emails",
    "templates",
    `${templateName}.html`
  );

  let html = fs.readFileSync(filePath, "utf8");

  Object.keys(vars).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, vars[key]);
  });

  return html;
}

// ============================================================
// NODEMAILER TRANSPORT
// ============================================================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: Number(process.env.EMAIL_SECURE) === 1,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================================
// SEND: VERIFY EMAIL
// ============================================================
async function sendVerificationEmail(to, token) {
  const VERIFY_URL = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = loadTemplate("verify-email", {
    VERIFY_URL,
    APP_NAME: "Great Nexus",
    YEAR: new Date().getFullYear(),
  });

  return transporter.sendMail({
    from: `"Great Nexus" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Confirme o seu email — Great Nexus",
    html,
  });
}

// ============================================================
// SEND: FORGOT PASSWORD (OTP)
// ============================================================
async function sendForgotPasswordEmail(to, otp, name) {
  const html = loadTemplate("forgot-password", {
    APP_NAME: "Great Nexus",
    USER_NAME: name || "",
    OTP_CODE: otp,
    EXPIRE_HUMAN: "15 minutos",
    SUPPORT_EMAIL: "support@greatnexus.com",
    YEAR: new Date().getFullYear(),
  });

  return transporter.sendMail({
    from: `"Great Nexus" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Código de recuperação de password",
    html,
  });
}

// ============================================================
// SEND: PASSWORD RESET SUCCESS
// ============================================================
async function sendPasswordResetSuccessEmail(to, name) {
  const html = loadTemplate("reset-password", {
    APP_NAME: "Great Nexus",
    USER_NAME: name || "",
    SUPPORT_EMAIL: "support@greatnexus.com",
    YEAR: new Date().getFullYear(),
  });

  return transporter.sendMail({
    from: `"Great Nexus" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Password alterada com sucesso",
    html,
  });
}

// ============================================================
// SEND: WELCOME EMAIL (após registro)
// ============================================================
async function sendWelcomeEmail(to, name) {
  const DASHBOARD_URL = `${process.env.FRONTEND_URL}/dashboard`;

  const html = loadTemplate("welcome", {
    APP_NAME: "Great Nexus",
    USER_NAME: name || "",
    DASHBOARD_URL,
    SUPPORT_EMAIL: "support@greatnexus.com",
    YEAR: new Date().getFullYear(),
  });

  return transporter.sendMail({
    from: `"Great Nexus" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Bem-vindo ao Great Nexus!",
    html,
  });
}

// ============================================================
// SEND: SUSPICIOUS LOGIN
// ============================================================
async function sendSuspiciousLoginEmail(to, vars) {
  const html = loadTemplate("suspicious-login", {
    ...vars,
    APP_NAME: "Great Nexus",
    YEAR: new Date().getFullYear(),
  });

  return transporter.sendMail({
    from: `"Great Nexus" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Alerta de atividade suspeita",
    html,
  });
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendPasswordResetSuccessEmail,
  sendSuspiciousLoginEmail,
  sendWelcomeEmail,
};
