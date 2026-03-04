// backend/src/utils/mailer.util.js
// KEYWORDS: NODEMAILER / SMTP / EMAIL_SEND / SAFE_TRANSPORT

const nodemailer = require("nodemailer");

function getTransport() {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!host || !port || !user || !pass) {
    const err = new Error("Faltan variables EMAIL_* en el .env (HOST/PORT/USER/PASSWORD).");
    err.statusCode = 500;
    throw err;
  }

  // KEYWORDS: secure true solo si usas 465
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

async function sendResetPasswordEmail({ to, resetUrl }) {
  const transport = getTransport();

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  // KEYWORDS: EMAIL_RESET_TEMPLATE
  const subject = "Restablecer contraseña - Tunik";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h2>Restablecer contraseña</h2>
      <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
      <p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 16px;border-radius:10px;background:#334e87;color:#fff;text-decoration:none;font-weight:700;">
          Restablecer contraseña
        </a>
      </p>
      <p>Si no solicitaste esto, ignora este correo.</p>
    </div>
  `;

  await transport.sendMail({
    from,
    to,
    subject,
    html,
  });
}

module.exports = {
  sendResetPasswordEmail,
};