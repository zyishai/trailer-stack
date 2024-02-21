import { Totp } from "~/models/totp";
import { User } from "~/models/user";
import { defaultPrivileges } from "./privileges";
import { UserCredential } from "~/models/credential";

export type Entity = { id: string; [key: string]: any };
export type Models = {
  user: User;
  totp: Totp;
  credential: UserCredential;
};

type DefaultPrivileges = keyof typeof defaultPrivileges;
type DefaultPrivilegeParameter<
  T extends DefaultPrivileges,
  E extends keyof (typeof defaultPrivileges)[T],
> = (typeof defaultPrivileges)[T][E] extends (param: infer P) => any ? P : {};
export type CombinedObjectParams<
  E extends keyof Models,
  T extends DefaultPrivileges,
> = Omit<
  (E extends keyof (typeof defaultPrivileges)[T]
    ? DefaultPrivilegeParameter<T, E>
    : {}) &
    DeepPartial<Models[E]>,
  "subject"
>;

export function isKeyOf<O extends Record<string, unknown>>(
  obj: O,
  key: string | number | symbol,
): key is keyof O {
  return key in obj;
}
export function isEntity(obj: unknown): obj is Entity {
  return !!obj && typeof obj === "object" && !Array.isArray(obj) && "id" in obj;
}
