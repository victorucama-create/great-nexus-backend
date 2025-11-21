// backend/src/utils/sendEmail.js
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// ========================================================================
// 🔹 Função para carregar templates HTML e substituir variáveis
// ========================================================================
function loadTemplate(templateName, variables = {}) {
  const filePath = path.join(__dirname, "..", "templates", `${templateName}.html`);

  let html = fs.readFileSync(filePath, "utf8");

  // Substituir {{VAR}}
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    html = html.replace(regex, variables[key]);
  });

  return html;
}

// ========================================================================
// 🔹 Criar transporter (SMTP)
// ========================================================================
async function createTransporter() {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true", // true para 465, false para outros
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

// ========================================================================
// 🔹 Função principal genérica para envio de emails
// ========================================================================
async function sendEmail({ to, subject, html, text }) {
  const transporter = await createTransporter();

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Great Nexus" <no-reply@greatnexus.com>`,
    to,
    subject,
    html,
    text: text || "",
  });
}

// ========================================================================
// 🔹 Enviar Email de Verificação
// ========================================================================
async function sendVerificationEmail(to, token) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  // Exemplo: https://app.greatnexus.com/verify-email?token=123
  const verifyUrl = `${frontendUrl.replace(/\/$/, "")}/verify-email?token=${token}`;

  const html = loadTemplate("verify-email", {
    VERIFY_URL: verifyUrl,
    APP_NAME: "Great Nexus",
    YEAR: new Date().getFullYear(),
  });

  return sendEmail({
    to,
    subject: "Confirme o seu email — Great Nexus",
    html,
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  loadTemplate,
};
