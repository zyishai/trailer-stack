import { z } from "zod";
import { EmailAddress } from "~/models/email";

export const OTPLoginSchema = z.object({ email: EmailAddress });
export type OTPLoginCredentials = z.infer<typeof OTPLoginSchema>;
export const TOTPVerifySchema = z.object({
  id: z.string(),
  otp: z.string(),
});
export type TOTPVerifyCredentials = z.infer<typeof TOTPVerifySchema>;
