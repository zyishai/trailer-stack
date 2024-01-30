import { z } from "zod";
import { EmailAddress } from "~/models/email";
import { Password } from "~/models/password";
import { Username } from "~/models/username";

export const LoginSchema = z.object({
  intent: z.literal("login"),
  username: Username,
  password: Password,
});

export const RegisterSchema = z.object({
  intent: z.literal("register"),
  username: Username,
  password: Password,
  email: EmailAddress,
});

type LoginCredentials = z.infer<typeof LoginSchema>;
type RegisterCredentials = z.infer<typeof RegisterSchema>;
export type FormStrategyCredentials = LoginCredentials | RegisterCredentials;
