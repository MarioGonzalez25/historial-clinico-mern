// backend/utils/supportEmail.js
import nodemailer from 'nodemailer';

async function buildTransporter() {
  const hasSmtp =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (hasSmtp) {
    return {
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }),
      usingEthereal: false,
    };
  }

  const testAccount = await nodemailer.createTestAccount();
  return {
    transporter: nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    }),
    usingEthereal: true,
  };
}

export async function sendSupportTicketEmail({ to, ticket }) {
  const { transporter, usingEthereal } = await buildTransporter();

  const from = process.env.MAIL_FROM || '"Centro Clínico" <no-reply@clinicadrawallis.com>';
  const subject = `Nuevo ticket de soporte ${ticket.folio}`;

  const texto = `Nuevo ticket de soporte\n\n` +
    `Folio: ${ticket.folio}\n` +
    `Asunto: ${ticket.asunto}\n` +
    `Prioridad: ${ticket.prioridad}\n` +
    `Solicitante: ${ticket.solicitante?.email} (${ticket.solicitante?.rol})\n\n` +
    `Descripción:\n${ticket.descripcion}`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
      <h2 style="margin-bottom:8px">Nuevo ticket de soporte</h2>
      <p style="margin:0"><strong>Folio:</strong> ${ticket.folio}</p>
      <p style="margin:0"><strong>Asunto:</strong> ${ticket.asunto}</p>
      <p style="margin:0"><strong>Prioridad:</strong> ${ticket.prioridad}</p>
      <p style="margin:0 0 16px 0"><strong>Solicitante:</strong> ${ticket.solicitante?.email} (${ticket.solicitante?.rol})</p>
      <p style="white-space:pre-line">${ticket.descripcion}</p>
    </div>
  `;

  const info = await transporter.sendMail({ from, to, subject, text: texto, html });
  return usingEthereal ? nodemailer.getTestMessageUrl(info) : null;
}
