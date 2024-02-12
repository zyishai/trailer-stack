export type AccessType = "CREATE" | "READ" | "UPDATE" | "DELETE";

export type Fields<T extends AuthrSubject = AuthrSubject> =
  | NonEmptyArray<keyof T extends string ? keyof T : string>
  | "*";

export type AuthrSubject = AuthrEntity;
export type AuthrModel = "user" | "credential" | "auth_token" | "totp";
export type AuthrObject =
  | AuthrEntity
  | { model: AuthrModel; details?: Record<string, any> };
export type AuthrEntity<T extends Record<string, any> = {}> = {
  id: string;
  [key: string]: any;
} & T;
