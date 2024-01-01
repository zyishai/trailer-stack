import { Authenticator } from "remix-auth";
import { User } from "~/models/user";
import { authSessionStorage } from "./session.server";
import credsStrategy from "./strategies/creds/strategy";
import totpStrategy from "./strategies/totp/strategy";

export const Strategies = {
  Credentials: "classic",
  TOTP: "totp",
} as const;

export const authenticator = new Authenticator<User>(authSessionStorage);
authenticator.use(credsStrategy, Strategies.Credentials);
authenticator.use(totpStrategy, Strategies.TOTP);
