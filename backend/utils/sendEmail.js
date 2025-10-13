// utils/sendEmail.js
import nodemailer from 'nodemailer';

/**
 * Envía el correo de reseteo.
 * - Si hay SMTP_* en .env, usa ese servidor.
 * - Si NO hay SMTP, crea una cuenta de pruebas en Ethereal automáticamente.
 *   En ese caso retorna { messageId, previewUrl } para abrir el correo en el navegador.
 */
export async function sendResetEmail({ to, resetLink }) {
  let transporter;
  let usingEthereal = false;

  const hasSmtp =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (hasSmtp) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // SSL en 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback de desarrollo: Ethereal
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    usingEthereal = true;
  }

  const from = process.env.MAIL_FROM || '"Sistema Clínico" <no-reply@sistema.com>';
  const subject = 'Recupera tu contraseña — Sistema Clínico';
  const text = `Hola,
Recibimos una solicitud para restablecer tu contraseña.
Abre este enlace (válido por poco tiempo) y define una nueva:
${resetLink}

Si no fuiste tú, ignora este mensaje.`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
    <h2>Recupera tu contraseña</h2>
    <p>Hola, recibimos una solicitud para restablecer tu contraseña.</p>
    <p>Si fuiste tú, haz clic en el siguiente botón (válido por poco tiempo):</p>
    <p>
      <a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#0d6efd;color:#fff;text-decoration:none;border-radius:6px">
        Restablecer contraseña
      </a>
    </p>
    <p>Si no fuiste tú, puedes ignorar este mensaje.</p>
    <hr/>
    <p style="font-size:12px;color:#666">Si el botón no funciona, copia y pega este enlace:<br/>
    <a href="${resetLink}">${resetLink}</a></p>
  </div>
  `;

  const info = await transporter.sendMail({ from, to, subject, text, html });
  const previewUrl = usingEthereal ? nodemailer.getTestMessageUrl(info) : null;

  return { messageId: info.messageId, previewUrl, usingEthereal };
}
