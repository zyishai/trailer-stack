import { ZodError, z } from "zod";

const envSchema = z.object({
  DB_ENDPOINT: z.string().url(),
  DB_ROOT_USERNAME: z.string(),
  DB_ROOT_PASSWORD: z.string(),
  DB_NAMESPACE: z.string().optional(),
  DB_DATABASE: z.string().optional(),
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
