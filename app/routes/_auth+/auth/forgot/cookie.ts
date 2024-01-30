import { createCookie } from "@remix-run/node";
import { createTypedCookie } from "remix-utils/typed-cookie";
import { z } from "zod";
import { isProdEnvironment } from "~/lib/env.server";

export const resetCookie = createTypedCookie({
  cookie: createCookie("reset", {
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.RESET_COOKIE_ENCRYPTION_SECRET],
    secure: isProdEnvironment,
  }),
  schema: z
    .object({
      id: z.string().optional(),
      otp: z.string().optional(),
      expires: z.string().datetime().optional(),
      userId: z.string().startsWith("user:").optional(), // Used to temporarily save the userId after token verification (see: loader in /reset-password route)
      error: z.string().optional(),
    })
    .nullable(),
});

export type ResetCookie = NonNullable<
  Awaited<ReturnType<(typeof resetCookie)["parse"]>>
>;

export async function setResetCookie(
  cookie: ResetCookie,
  payload: { id: string; otp: string; expires: string },
) {
  cookie.id = payload.id;
  cookie.otp = payload.otp;
  cookie.expires = payload.expires;
  return resetCookie.serialize(cookie);
}

export async function clearResetCookie(cookie: ResetCookie) {
  delete cookie.id;
  delete cookie.otp;
  delete cookie.expires;
  delete cookie.userId;
  return resetCookie.serialize(cookie);
}
