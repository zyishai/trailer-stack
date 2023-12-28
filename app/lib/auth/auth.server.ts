import { Authenticator } from "remix-auth";
import { User } from "~/models/user";
import { authSessionStorage } from "./session.server";
import formStrategy from "./strategies/form/form.strategy";

export const Strategies = {
  ClassicUserPassword: "classic",
} as const;

export const authenticator = new Authenticator<User>(authSessionStorage);
authenticator.use(formStrategy, Strategies.ClassicUserPassword);
