import { Authenticator } from "remix-auth";
import { User } from "~/models/user";
import { authSessionStorage } from "./session.server";
import credsStrategy from "./strategies/creds/strategy";

export const Strategies = {
  Credentials: "classic",
} as const;

export const authenticator = new Authenticator<User>(authSessionStorage);
authenticator.use(credsStrategy, Strategies.Credentials);
