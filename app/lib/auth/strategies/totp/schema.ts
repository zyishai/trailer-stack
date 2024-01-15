import { z } from "zod";
import { EmailAddress } from "~/models/email";

export const TOTPLoginSchema = z.object({ email: EmailAddress });
export type TOTPLoginCredentials = z.infer<typeof TOTPLoginSchema>;
export const TOTPVerifySchema = z.object({ otp: z.string() });
export type TOTPVerifyCredentials = z.infer<typeof TOTPVerifySchema>;
