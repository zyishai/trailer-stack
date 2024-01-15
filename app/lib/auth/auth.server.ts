import { Authenticator } from "remix-auth";
import { User } from "~/models/user";
import { authSessionStorage } from "./session.server";
import credsStrategy from "./strategies/creds/strategy";
import totpStrategy from "./strategies/totp/strategy";
import authnStrategy from "./strategies/authn/strategy";
import { z } from "zod";

export const Strategies = {
  Credentials: "classic",
  TOTP: "totp",
  AUTHN: "authn",
} as const;

export const authenticator = new Authenticator<User>(authSessionStorage);
authenticator.use(credsStrategy, Strategies.Credentials);
authenticator.use(totpStrategy, Strategies.TOTP);
authenticator.use(authnStrategy, Strategies.AUTHN);

const AuthenticatorKeysSchema = z.object({
  sessionKey: z.literal("user"),
  sessionErrorKey: z.literal("auth:error"),
  sessionStrategyKey: z.literal("strategy"),
});

export const authenticatorSessionKeys =
  AuthenticatorKeysSchema.parse(authenticator);

export function generateWebauthnOptions(request: Request, user: User | null) {
  return authnStrategy.generateOptions(request, authSessionStorage, user);
}
