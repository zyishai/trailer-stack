import { createCookieSessionStorage } from "@remix-run/node";
import { createTypedSessionStorage } from "remix-utils/typed-session";
import { z } from "zod";
import { authenticatorSessionKeys } from "./auth.server";
import { User } from "~/models/user";
import { EmailAddress } from "~/models/email";

const cookieName = "AS_info_session";

const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: cookieName,
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.AUTH_COOKIE_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const schema = z.object({
  user: User.or(z.null()).optional(),
  "auth:error": z.object({ message: z.string() }).optional(),
  otp: z.string().optional(),
  email: EmailAddress.optional(),
  challenge: z.any(),
});
const typedAuthSessionStorage = createTypedSessionStorage({
  sessionStorage: authSessionStorage,
  schema,
});

export { authSessionStorage, typedAuthSessionStorage };
export { authenticatorSessionKeys };
