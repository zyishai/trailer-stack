import { Authenticator } from "remix-auth";
import { User } from "~/models/user";
import { authSessionStorage } from "./session.server";
import credsStrategy from "./strategies/creds/strategy";
import totpStrategy from "./strategies/totp/strategy";
import authnStrategy from "./strategies/authn/strategy";

export const Strategies = {
  Credentials: "classic",
  TOTP: "totp",
  AUTHN: "authn",
} as const;

export const authenticator = new Authenticator<User>(authSessionStorage);
authenticator.use(credsStrategy, Strategies.Credentials);
authenticator.use(totpStrategy, Strategies.TOTP);
authenticator.use(authnStrategy, Strategies.AUTHN);

export function generateWebauthnOptions(request: Request, user: User | null) {
  return authnStrategy.generateOptions(request, authSessionStorage, user);
}
