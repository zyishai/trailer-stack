import { createCookieSessionStorage } from "@remix-run/node";

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

export { authSessionStorage };
