import { z } from "zod";
import { EmailAddress } from "~/models/email";
import { Password } from "~/models/password";

export const ForgotPasswordSchema = z.object({ email: EmailAddress });
export const ResetPasswordSchema = z
  .object({
    userId: z.string(),
    password: z
      .string()
      .min(6, { message: "Password too short (need >6 letters)" })
      .max(10, { message: "Password too long (need <10 letters)" })
      .and(Password),
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
