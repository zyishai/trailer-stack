import { verifyTOTP } from "@epic-web/totp";
import { getTOTP, recordFailedAttempt } from "~/models/totp";
import { ResetCookie, clearResetCookie } from "./cookie";
import { AuthenticationError } from "~/lib/error";

export async function verifyOTP(
  otpId: string,
  otp: string,
  cookie?: ResetCookie,
) {
  const totp = await getTOTP(otpId);
  if (!totp) {
    console.warn(
      `🟠 Suspected OTP guessing: OTP not found in database. OTP value: ${otp}, OTP id: ${otpId}`,
    );
    if (cookie) {
      clearResetCookie(cookie);
    }
    throw new AuthenticationError("OTP_INVALID");
  }

  if (!totp.active) {
    if (cookie) {
      clearResetCookie(cookie);
    }
    throw new AuthenticationError("OTP_EXPIRED");
  }

  const result = verifyTOTP({
    otp,
    algorithm: totp.algorithm,
    charSet: totp.charSet,
    digits: totp.digits,
    period: totp.period,
    secret: totp.secret,
  });

  if (!result) {
    await recordFailedAttempt(otpId);
    console.warn(
      `🟠 Failed OTP verification: OTP value does not match payload. OTP id: ${otpId}, OTP value: ${otp}`,
    );
    throw new AuthenticationError("OTP_INVALID");
  }

  return totp;
}
