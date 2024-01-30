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
  username: z
    .string()
    .min(4, { message: "Username too short (need >4 letters)" })
    .max(10, { message: "Username too long (need <10 letters)" })
    .and(Username),
  password: z
    .string()
    .min(6, { message: "Password too short (need >6 letters)" })
    .max(10, { message: "Password too long (need <10 letters)" })
    .and(Password),
  email: EmailAddress,
});

type LoginCredentials = z.infer<typeof LoginSchema>;
type RegisterCredentials = z.infer<typeof RegisterSchema>;
export type FormStrategyCredentials = LoginCredentials | RegisterCredentials;
