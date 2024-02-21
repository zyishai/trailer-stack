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
      error: z.string().optional(),
      // isChanged: z.boolean().default(false).optional()
    })
    .nullable(),
});

export type ResetCookie = NonNullable<
  Awaited<ReturnType<(typeof resetCookie)["parse"]>>
>;

export function setResetCookie(
  cookie: ResetCookie,
  payload: { id: string; otp: string; expires: string },
) {
  cookie.id = payload.id;
  cookie.otp = payload.otp;
  cookie.expires = payload.expires;
  // cookie.isChanged = true;
}

export function clearResetCookie(cookie: ResetCookie) {
  delete cookie.id;
  delete cookie.otp;
  delete cookie.expires;
  // cookie.isChanged = true;
}

export async function commitResetCookie(cookie: ResetCookie) {
  // cookie.isChanged = false;
  return resetCookie.serialize(cookie);
}
