import { z } from "zod";
import { EmailAddress } from "~/models/email";
import { Password } from "~/models/password";

export const ForgotPasswordSchema = z.object({ email: EmailAddress });
export const ResetPasswordSchema = z
  .object({
    userId: z.string().startsWith("user:"),
    password: Password,
    confirm: Password,
  })
  .superRefine(({ password, confirm }, ctx) => {
    if (password !== confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirm"],
      });
    }
  });
