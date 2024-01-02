import { ZodError, z } from "zod";

const envSchema = z.object({
  DB_ENDPOINT: z.string().url(),
  DB_ROOT_USERNAME: z.string(),
  DB_ROOT_PASSWORD: z.string(),
  DB_NAMESPACE: z.string().optional(),
  DB_DATABASE: z.string().optional(),
  MAIL_SMTP_HOST: z.string(),
  MAIL_SMTP_PORT: z.coerce.number().nonnegative(),
  MAIL_AUTH_USER: z.string().optional(),
  MAIL_AUTH_PASS: z.string().optional(),
  DEV_MAIL_SMTP_HOST: z.string().optional(),
  DEV_MAIL_SMTP_PORT: z.coerce.number().nonnegative().optional(),
  DEV_MAIL_AUTH_USER: z.string().optional(),
  DEV_MAIL_AUTH_PASS: z.string().optional(),
  EMAIL_TEMPLATES_DIR: z.string(),
  AUTH_COOKIE_SECRET: z.string().min(32 /* 16 bytes hex string */),
  TOTP_ENCRYPTION_SECRET: z.string().min(32),
  APP_NAME: z.string(),
  // add here more variables as needed
});

export function validateEnvironmentVariables() {
  try {
    envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(
        `❗️ Problem with the following environment variables: ${Object.keys(
          error.flatten().fieldErrors,
        ).join(", ")}. Make sure they're present and in the correct format.`,
      );
    } else {
      console.log(
        "❗️ There was an error while validating global environment variables.",
      );
    }
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
