import { TOTPStrategy } from "remix-auth-totp";
import { getDatabaseInstance } from "~/lib/db.server";
import {
  Totp,
  TotpResponse,
  createTotp,
  getTotpByHash,
  updateTotp,
} from "~/models/totp";
import { sendEmail, validateEmailAddress } from "~/lib/email.server";
import TotpTemplate from "~/components/emails/totp";
import { parse } from "@conform-to/zod";
import { emailSchema } from "./schema";
import {
  User,
  UserResponse,
  getUserByEmailAddress,
  verifyUserEmailExists,
} from "~/models/user";

function responseToSearchParams(response?: Record<string, any>) {
  const params = new URLSearchParams();

  if (!response) {
    return params;
  }

  for (const [key, value] of Object.entries(response)) {
    if (value !== null && value !== undefined) {
      params.append(key, value.toString());
    }
  }

  return params;
}

export default new TOTPStrategy(
  {
    secret: process.env.TOTP_ENCRYPTION_SECRET,
    createTOTP: async (data, expiresAt) => {
      const db = await getDatabaseInstance();
      const results = await db.query<TotpResponse>(createTotp, {
        ...data,
        expiresAt: expiresAt.toISOString(),
      });
      const totp = parse(responseToSearchParams(results[0]), { schema: Totp });
      if (!totp.value) {
        throw new Error("Could not generate OTP code");
      } else {
        console.debug(
          `ℹ️ Generated totp: ${totp.value.hash}. ⏰ Expires at: ${totp.value.expiresAt}`,
        );
      }
    },
    readTOTP: async hash => {
      const db = await getDatabaseInstance();
      const results = await db.query<TotpResponse>(getTotpByHash, { hash });
      const totp = parse(responseToSearchParams(results[0]), { schema: Totp });
      if (!totp.value) {
        return null;
      } else {
        return totp.value;
      }
    },
    updateTOTP: async (hash, data) => {
      const db = await getDatabaseInstance();
      const results = await db.query<TotpResponse>(updateTotp, {
        hash,
        ...data,
      });
      const totp = parse(responseToSearchParams(results[0]), { schema: Totp });
      if (!totp.value) {
        console.warn(
          `⚠️ Failed to update totp ${hash}. Tried to apply the following changes: ${JSON.stringify(
            data,
            null,
            2,
          )}`,
        );
      } else {
        console.debug(
          `ℹ️ Updated totp: ${totp.value.hash}. ⚙️ Active: ${totp.value.active}, 🔢 Attempts: ${totp.value.attempts}`,
        );
      }
    },
    sendTOTP: async ({ email, code, magicLink, request, form }) => {
      const response = await sendEmail({
        email: TotpTemplate({ verificationCode: code, magicLink: magicLink }),
        to: email,
        subject: "[Trailer Stack] Action required",
      });
      console.debug(`✉️ Mail have been sent: ${response.messageId}.`);
      if (!response.accepted.includes(email)) {
        console.warn(`⚠️ Failed to send verification email to ${email}`);
      }
    },
    validateEmail: async email => {
      // Validate email address format
      const userEmail = parse(new URLSearchParams({ email }), {
        schema: emailSchema,
      });
      if (!userEmail.value) {
        throw userEmail;
      }

      // Make sure user is registered
      const db = await getDatabaseInstance();
      await db.query(verifyUserEmailExists, { email: userEmail.value.email }); // It'll throw if email not found

      // Verify email address is trusted and not disposable
      const isEmailValid = await validateEmailAddress(email);
      if (!isEmailValid) {
        userEmail.error.email = ["Invalid email address"];
        throw userEmail;
      }
    },
    magicLinkGeneration: {
      callbackPath: "/auth/totp/magic-link", // default: '/magic-link'
    },
    customErrors: {
      totpNotFound: "Code is no longer active.",
    },
  },
  async function verify({
    email,
    code /* always undefined. @see: https://github.com/dev-xo/remix-auth-totp/blob/e63befdd0fb40d67b941662fa43bec75b85b0cb2/src/index.ts#L557 */,
    magicLink,
    request,
    form,
  }) {
    const db = await getDatabaseInstance();
    const results = await db.query<UserResponse>(getUserByEmailAddress, {
      email,
    });
    const userResult = responseToSearchParams(results[0]);
    const user = parse(userResult, { schema: User });
    if (!user.value) {
      throw new Error("Login failed");
    }

    return user.value;
  },
);
