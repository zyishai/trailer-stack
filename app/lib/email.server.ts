import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { render } from "@react-email/components";
import { isDevEnvironment } from "./env.server";

const transporter = nodemailer.createTransport({
  ...getTransporterConfig(),
  // Set this to `true` if you use `ssl`. If you use `tls` or your mail delivery server supports STARTTLS - you can keep it `false`.
  // secure: false
});

function getTransporterConfig(): SMTPTransport.Options {
  const {
    DEV_MAIL_SMTP_HOST,
    DEV_MAIL_SMTP_PORT,
    DEV_MAIL_AUTH_USER,
    DEV_MAIL_AUTH_PASS,
    MAIL_SMTP_HOST,
    MAIL_SMTP_PORT,
    MAIL_AUTH_USER,
    MAIL_AUTH_PASS,
  } = process.env;

  return {
    host: isDevEnvironment
      ? DEV_MAIL_SMTP_HOST ?? MAIL_SMTP_HOST
      : MAIL_SMTP_HOST,
    port: isDevEnvironment
      ? DEV_MAIL_SMTP_PORT ?? MAIL_SMTP_PORT
      : MAIL_SMTP_PORT,
    auth: {
      user: isDevEnvironment
        ? DEV_MAIL_AUTH_USER ?? MAIL_AUTH_USER
        : MAIL_AUTH_USER,
      pass: isDevEnvironment
        ? DEV_MAIL_AUTH_PASS ?? MAIL_AUTH_PASS
        : MAIL_AUTH_PASS,
    },
  };
}

type MailProps = {
  from?: string;
  to: string;
  subject: string;
  email: React.ReactElement;
  attachments?: Attachment[];
};
export async function sendEmail({
  from = "Trailer Stack <trailer@remix.stack>",
  to,
  subject,
  email,
  attachments,
}: MailProps) {
  const { html, text } = await renderTemplate(email);

  const response = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
    attachments,
  });
  console.debug(`✉️ Mail have been sent: ${response.messageId}.`);
  if (!response.accepted.includes(to)) {
    console.warn(`⚠️ Failed to send verification email to ${to}`);
  }

  return response;
}

export async function renderTemplate(template: React.ReactElement) {
  const html = render(template, { pretty: isDevEnvironment });
  const text = render(template, { plainText: true, pretty: isDevEnvironment });

  return { html, text };
}
