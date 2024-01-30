import { createCookie } from "@remix-run/node";
import { createTypedCookie } from "remix-utils/typed-cookie";
import { z } from "zod";
import { isProdEnvironment } from "~/lib/env.server";
import { EmailAddress } from "~/models/email";

export const otpCookie = createTypedCookie({
  cookie: createCookie("otp", {
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.TOTP_COOKIE_ENCRYPTION_SECRET],
    secure: isProdEnvironment,
  }),
  schema: z
    .object({
      id: z.string().optional(),
      expires: z.string().datetime().optional(),
      email: EmailAddress.optional(),
      error: z.string().optional(),
    })
    .nullable(),
});
export type OtpCookie = NonNullable<
  Awaited<ReturnType<(typeof otpCookie)["parse"]>>
>;

export async function setOtpCookie(
  cookie: OtpCookie,
  params: { id: string; expires: string; email: EmailAddress },
) {
  cookie.id = params.id;
  cookie.expires = params.expires;
  cookie.email = params.email;
  return await otpCookie.serialize(cookie);
}

export async function clearOtpCookie(cookie: OtpCookie) {
  delete cookie.id;
  delete cookie.expires;
  delete cookie.email;
  delete cookie.error;
  return await otpCookie.serialize(cookie);
}
