// src/server/utils/mailer.ts
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'SendGrid', // or SES, Postmark, Gmail App Password
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: 'no-reply@azoraos.com',
    to,
    subject,
    html
  });
}
