import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { render } from "@react-email/components";
import { glob } from "glob";
import { join, basename, normalize } from "node:path";
import esbuild from "esbuild";
import * as emailValidator from "deep-email-validator";

const isDevEnvironment = process.env.NODE_ENV !== "production";

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

export async function validateEmailAddress(emailAddress: string) {
  const validationResult = await emailValidator.validate(emailAddress);
  if (!validationResult.valid) {
    const { validators, reason } = validationResult;
    const validationReason = reason
      ? validators[reason as keyof typeof validators]?.reason
      : "Unknown reason";
    console.warn(
      `⚠️ Email Validation Error: Invalid email address. 👉 Reason: ${validationReason}`,
    );
    return false;
  } else {
    return true;
  }
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

  return transporter.sendMail({ from, to, subject, html, text, attachments });
}

export async function renderTemplate(template: React.ReactElement) {
  const html = render(template, { pretty: isDevEnvironment });
  const text = render(template, { plainText: true, pretty: isDevEnvironment });

  return { html, text };
}

export function getTemplatesDir() {
  return join(process.cwd(), process.env.EMAIL_TEMPLATES_DIR);
}

export async function getTemplatesNames() {
  const emailsDir = join(process.cwd(), process.env.EMAIL_TEMPLATES_DIR);
  const templatePaths = await glob(`${emailsDir}/*.tsx`);
  return templatePaths.map(path => basename(path).split(".")[0]);
}

type CompileTemplateProps = {
  templateName: string;
  write?: boolean;
  tsconfig?: string;
  outDir?: string;
};
export async function compileTemplate({
  templateName,
  write = false,
  tsconfig = join(process.cwd(), "tsconfig.json"),
  outDir = process.cwd(),
}: CompileTemplateProps) {
  const buildId = Date.now();
  const templatesDir = getTemplatesDir();
  const templatePath = normalize(`${templatesDir}/${templateName}.tsx`);
  const buildResult = await esbuild.build({
    entryPoints: [templatePath],
    entryNames: `[name]-${buildId}`,
    bundle: true,
    platform: "node",
    write,
    tsconfig,
    outdir: outDir,
    outExtension: {
      ".js": ".cjs",
    },
  });

  if (buildResult.errors.length > 0) {
    console.error(buildResult.errors);
    throw new Error(
      `🚨 esbuild encountered error(s) while trying to build template. Template Name: ${templateName}.`,
    );
  }

  if (buildResult.warnings.length > 0) {
    console.warn(`⚠️ esbuild finished with the following warnings:`);
    console.warn(buildResult.warnings);
  }

  const outFilePath = normalize(`${outDir}/${templateName}-${buildId}.cjs`);
  return {
    out: outFilePath,
    buildId,
    outHash: buildResult.outputFiles?.[0].hash,
  };
}
