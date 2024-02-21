import { getTOTP } from "~/models/totp";
import { getUserById } from "~/models/user";

export const constraintsMap = {
  /** @description The otp has not expired or revoked */
  TOTP_IS_ACTIVE: async (payload: Payload) => {
    const totpId = payload.objectId;
    const totp = await getTOTP(totpId);
    return !!totp?.active;
  },
  /** @description the requested object, is the same user as the subject */
  USER_IS_SELF: async (payload: Payload) => {
    const { subjectId, objectId } = payload;
    const user = await getUserById(subjectId);
    return !!user && subjectId === objectId;
  },
} as const;

type Payload = { subjectId: string; objectId: string; fields?: string[] };
export type ConstraintKey = keyof typeof constraintsMap;
