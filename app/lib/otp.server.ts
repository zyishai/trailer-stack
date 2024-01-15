import { generateTOTP, verifyTOTP } from "@epic-web/totp";
import jwt from "jsonwebtoken";
import { EmailAddress } from "~/models/email";
import { hash as argon2hash } from "argon2";
const { sign, verify } = jwt;

type GeneratePayload = {
  email: string;
  expiresIn?: number /* in seconds */;
};
/**
 * @param params.email
 * @param params.expiresIn in seconds
 */
export async function generateOTP({
  email,
  expiresIn = 600 /* 10 mins */,
}: GeneratePayload) {
  const { otp, ...payload } = generateTOTP();
  const hash = sign(
    {
      ...payload,
      email,
    },
    process.env.TOTP_ENCRYPTION_SECRET,
    {
      algorithm: "HS256",
      expiresIn,
    },
  );
  return { otp, payload: hash };
}

export async function encryptOTP(otp: string) {
  const hash = argon2hash(otp, {
    salt: Buffer.from(process.env.TOTP_ENCRYPTION_SECRET),
  });
  return hash;
}

type VerifyPayload = {
  payload: string;
  otp: string;
};
export async function verifyOTP({ payload, otp }: VerifyPayload) {
  const decoded = verify(payload, process.env.TOTP_ENCRYPTION_SECRET) as Pick<
    Parameters<typeof verifyTOTP>[0],
    "algorithm" | "charSet" | "digits" | "period" | "secret"
  > & { email: EmailAddress };

  const verificationResponse = verifyTOTP({
    otp,
    ...decoded,
  });

  return verificationResponse ? decoded : null;
}
