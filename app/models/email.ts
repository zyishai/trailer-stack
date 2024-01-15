import { z } from "zod";
import normalizeEmail from "normalize-email";
import { emailValidator } from "~/lib/email.server";

/**
 * @description **Note!** this schema is using `async` refinement. Must be used with `parseAsync` or `safeParseAsync` or `parse(..., { async: true })`. Otherwise, Zod will throw an error.
 */
export const EmailAddress = z
  .string({ required_error: "Missing email address" })
  .email({ message: "Invalid email address" })
  .superRefine(async (address, ctx) => {
    // This validators makes sure the email address is accessible
    // and not a disposable address.
    const validationResult = await emailValidator.validate(address);
    if (!validationResult.valid) {
      const { reason, validators } = validationResult;
      const validationReason = reason
        ? validators[reason as keyof typeof validators]?.reason
        : "Unknown reason";
      console.warn(
        `⚠️ Email Validation Error: Invalid email address. 👉 Reason: ${validationReason}`,
      );
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_string,
        message: "Invalid email address",
        validation: "email",
        fatal: true,
      });

      return z.NEVER;
    }
  })
  .transform(normalizeEmail)
  .brand<"EmailAddress">();
export type EmailAddress = z.infer<typeof EmailAddress>;
