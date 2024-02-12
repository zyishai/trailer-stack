import { getTOTP } from "~/models/totp";
import { AuthrEntity, AuthrSubject, Fields } from "./types";
import { getUserById } from "~/models/user";

type ConstraintValue = {
  check(payload: {
    subject: AuthrSubject;
    object: AuthrEntity;
    details?: { fields?: Fields };
  }): Promise<boolean> | boolean;
};
export const Constraints = {
  /** @description The otp has not expired or revoked */
  TOTP_IS_ACTIVE: {
    async check(payload) {
      const totpId = payload.object.id;
      const totp = await getTOTP(totpId);
      return !!totp?.active;
    },
  } satisfies ConstraintValue,
  /** @description the requested object, is the same user as the subject */
  USER_IS_SELF: {
    async check(payload) {
      const { subject, object } = payload;
      const user = await getUserById(subject.id);
      return !!user && subject.id === object.id;
    },
  } satisfies ConstraintValue,
} as const;
export type Constraint = keyof typeof Constraints;
