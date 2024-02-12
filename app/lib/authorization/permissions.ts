import { getUserById } from "~/models/user";
import { AuthrSubject } from "./types";

type PermissionValue<Details = Record<string, any>> = {
  check(payload: {
    subject: AuthrSubject;
    details?: Details;
  }): Promise<boolean> | boolean;
};
export const Permissions = {
  READ_USER: {
    async check(payload) {
      const { subject, details } = payload;
      const user = await getUserById(subject.id);

      if (!user) {
        return false;
      }

      // very naive check if the user is admin
      if (user.username === "admin") {
        return true;
      }

      return details?.userId === user.id;
    },
  } satisfies PermissionValue<{ userId?: string }>,
  READ_CREDENTIAL: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  READ_AUTH_TOKEN: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  READ_OTP: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  UPDATE_USER: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  UPDATE_CREDENTIAL: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  UPDATE_AUTH_TOKEN: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  UPDATE_OTP: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  CREATE_USER: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  CREATE_CREDENTIAL: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  CREATE_AUTH_TOKEN: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  CREATE_OTP: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  DELETE_USER: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  DELETE_CREDENTIAL: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  DELETE_AUTH_TOKEN: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
  DELETE_OTP: {
    async check(payload) {
      return false;
    },
  } satisfies PermissionValue,
} as const;
export type Permission = keyof typeof Permissions;
