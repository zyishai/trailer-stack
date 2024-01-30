import { verifyTOTP } from "@epic-web/totp";
import { AuthorizationError } from "remix-auth";
import { deactivateTOTP, getTOTP, recordFailedAttempt } from "~/models/totp";
import { OtpCookie, clearOtpCookie } from "./cookie";

export async function verifyOTP(
  otpId: string,
  otp: string,
  cookie?: OtpCookie,
) {
  const totp = await getTOTP(otpId);
  if (!totp) {
    console.warn(
      `🟠 Suspected OTP guessing: OTP not found in database. OTP value: ${otp}, OTP id: ${otpId}`,
    );
    throw new AuthorizationError("Invalid OTP");
  }

  if (!totp.active) {
    if (cookie) {
      await clearOtpCookie(cookie);
    }
    throw new AuthorizationError("OTP is no longer active");
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
    throw new AuthorizationError("Invalid OTP");
  }

  if (!(await deactivateTOTP(otpId))) {
    console.warn(
      `🟠 Failed to deactivate OTP after request to another OTP was made. OTP id: ${otpId}, OTP value: ${otp}`,
    );
  }

  return totp;
}
