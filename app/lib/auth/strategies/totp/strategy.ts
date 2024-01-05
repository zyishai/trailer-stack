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
      params.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : value.toString(),
      );
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
        type: "auth",
        data: {
          ...data,
          expiresAt: expiresAt.toISOString(),
        },
      });
      const totp = Totp.safeParse(results[0]);
      if (!totp.success || totp.data.type !== "auth") {
        throw new Error("Could not generate OTP code");
      } else {
        console.debug(
          `ℹ️ Generated totp: ${totp.data.data.hash}. ⏰ Expires at: ${totp.data.data.expiresAt}`,
        );
      }
    },
    readTOTP: async hash => {
      const db = await getDatabaseInstance();
      const results = await db.query<TotpResponse>(getTotpByHash, { hash });
      const totp = Totp.safeParse(results[0]);
      if (!totp.success || totp.data.type !== "auth") {
        return null;
      } else {
        return totp.data.data;
      }
    },
    updateTOTP: async (hash, data) => {
      const db = await getDatabaseInstance();
      const results = await db.query<TotpResponse>(updateTotp, {
        hash,
        ...data,
      });
      const totp = Totp.safeParse(results[0]);
      if (!totp.success || totp.data.type !== "auth") {
        console.warn(
          `⚠️ Failed to update totp ${hash}. Tried to apply the following changes: ${JSON.stringify(
            data,
            null,
            2,
          )}`,
        );
      } else {
        console.debug(
          `ℹ️ Updated totp: ${totp.data.data.hash}. ⚙️ Active: ${totp.data.data.active}, 🔢 Attempts: ${totp.data.data.attempts}`,
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
