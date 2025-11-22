// backend/src/utils/sendEmail.js
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

function loadTemplate(templateName, vars = {}) {
  const filePath = path.join(__dirname, "..", "emails", "templates", `${templateName}.html`);
  let html = fs.readFileSync(filePath, "utf8");
  Object.keys(vars).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, vars[key] ?? "");
  });
  return html;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: Number(process.env.EMAIL_SECURE) === 1,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(to, token, name = "") {
  const VERIFY_URL = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = loadTemplate("verify-email", {
    VERIFY_URL,
    APP_NAME: process.env.APP_NAME || "Great Nexus",
    NAME: name,
    YEAR: new Date().getFullYear(),
  });
  return transporter.sendMail({
    from: `"${process.env.APP_NAME || "Great Nexus"}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Confirme seu email — " + (process.env.APP_NAME || "Great Nexus"),
    html,
  });
}

async function sendForgotPasswordEmail(to, otp, name = "") {
  const html = loadTemplate("forgot-password", {
    OTP_CODE: otp,
    USER_NAME: name,
    APP_NAME: process.env.APP_NAME || "Great Nexus",
    YEAR: new Date().getFullYear(),
  });
  return transporter.sendMail({
    from: `"${process.env.APP_NAME || "Great Nexus"}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Código de recuperação — " + (process.env.APP_NAME || "Great Nexus"),
    html,
  });
}

async function sendPasswordResetSuccessEmail(to, name = "") {
  const html = loadTemplate("reset-password", {
    USER_NAME: name,
    APP_NAME: process.env.APP_NAME || "Great Nexus",
    YEAR: new Date().getFullYear(),
  });
  return transporter.sendMail({
    from: `"${process.env.APP_NAME || "Great Nexus"}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Password alterada — " + (process.env.APP_NAME || "Great Nexus"),
    html,
  });
}

async function sendWelcomeEmail(to, name = "") {
  const html = loadTemplate("welcome", {
    USER_NAME: name,
    DASHBOARD_URL: `${process.env.FRONTEND_URL}/dashboard`,
    APP_NAME: process.env.APP_NAME || "Great Nexus",
    YEAR: new Date().getFullYear(),
  });
  return transporter.sendMail({
    from: `"${process.env.APP_NAME || "Great Nexus"}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Bem-vindo ao " + (process.env.APP_NAME || "Great Nexus"),
    html,
  });
}

async function sendSuspiciousLoginEmail(to, vars = {}) {
  const html = loadTemplate("suspicious-login", {
    ...vars,
    APP_NAME: process.env.APP_NAME || "Great Nexus",
    YEAR: new Date().getFullYear(),
  });
  return transporter.sendMail({
    from: `"${process.env.APP_NAME || "Great Nexus"}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Alerta de acesso suspeito — " + (process.env.APP_NAME || "Great Nexus"),
    html,
  });
}

module.exports = {
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendPasswordResetSuccessEmail,
  sendWelcomeEmail,
  sendSuspiciousLoginEmail,
};
