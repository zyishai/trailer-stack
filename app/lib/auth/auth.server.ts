import { Authenticator } from "remix-auth";
import { User } from "~/models/user";
import { authSessionStorage } from "./session.server";
import formStrategy from "./strategies/form/form.strategy";

export const Strategies = {
  ClassicUserPassword: "classic",
} as const;

export const authenticator = new Authenticator<User>(authSessionStorage);
authenticator.use(formStrategy, Strategies.ClassicUserPassword);

export async function notused_getAuthErrorMessage(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const error = authSession.get(authenticator.sessionErrorKey);

  return {
    error: error.message,
    headers: {
      "Set-Cookie": await authSessionStorage.commitSession(authSession),
    },
  };
}
