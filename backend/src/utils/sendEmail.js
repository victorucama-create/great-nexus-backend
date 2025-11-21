const nodemailer = require("nodemailer");

module.exports = async function sendEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter.sendMail({
    from: `"Great Nexus" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};
