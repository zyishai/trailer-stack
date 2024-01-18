import { type SessionData, SessionStorage, redirect } from "@remix-run/node";
import type SMTPTransport from "nodemailer";
import {
  AuthenticateOptions,
  AuthorizationError,
  Strategy,
  StrategyVerifyCallback,
} from "remix-auth";
import { z } from "zod";
import { EmailAddress } from "~/models/email";
import type { Totp } from "~/models/totp";
import { User } from "~/models/user";
import { encryptOTP, generateOTP, verifyOTP } from "../otp.server";
import { getDomain } from "../misc";
import { getAuthSession } from "./session.server";

const ContextSchema = z
  .object({ email: EmailAddress })
  .transform(({ email }) => ({ email, stage: "generate" as const }))
  .or(
    z
      .object({ otp: z.string().optional() })
      .catch({})
      .transform(({ otp }) => ({ otp, stage: "verify" as const })),
  );

type TOTPVerifyParams = {
  otp: string;
  email: EmailAddress;
};

interface TOTPConfig {
  options?: {
    magicLinkUrl?: string;
  };
  getUserByEmail: (email: EmailAddress) => Promise<User | null>;
  storeOTP: (otp: string, payload: string) => Promise<Totp | null>;
  getOTP: (otp: string) => Promise<Totp | null>;
  deactivateOTP: (totp: Totp) => Promise<boolean>;
  sendEmail: (options: {
    to: EmailAddress;
    otp: string;
    verificationLink: string;
  }) => Promise<SMTPTransport.SentMessageInfo>;
}
export class OTPStrategy extends Strategy<User, TOTPVerifyParams> {
  public name = "__trailer__totp_strategy__";

  private readonly options;
  private readonly getUserByEmail;
  private readonly storeOTP;
  private readonly getOTP;
  private readonly deactivateOTP;
  private readonly sendEmail;

  constructor(
    config: TOTPConfig,
    verify: StrategyVerifyCallback<User, TOTPVerifyParams>,
  ) {
    super(verify);
    this.options = {
      magicLinkUrl: "/magic-link",
      ...config.options,
    };
    this.getUserByEmail = config.getUserByEmail;
    this.storeOTP = config.storeOTP;
    this.getOTP = config.getOTP;
    this.deactivateOTP = config.deactivateOTP;
    this.sendEmail = config.sendEmail;
  }

  async authenticate(
    request: Request,
    sessionStorage: SessionStorage<SessionData, SessionData>,
    options: AuthenticateOptions,
  ): Promise<User> {
    try {
      const parsed = await ContextSchema.safeParseAsync(options.context);
      if (!parsed.success) {
        throw new Error(
          "context needs either an `email` property (type: EmailAddress) or an `otp` property (type: string)",
        );
      }

      if (parsed.data.stage === "generate") {
        if (!options.successRedirect) {
          throw new Error("successRedirect is required");
        }

        const email = parsed.data.email;

        const user = await this.getUserByEmail(email);
        if (!user) {
          throw new Error("Server error: could not find user");
        }

        const { otp, payload } = await generateOTP({ email });
        const encryptedOtp = await encryptOTP(otp);
        const totp = await this.storeOTP(encryptedOtp, payload);
        if (!totp) {
          throw new Error("Server error: failed to generate OTP code");
        }

        const magicLink = getDomain(
          request,
          `${this.options.magicLinkUrl}?code=${otp}`,
        );
        await this.sendEmail({ to: email, otp, verificationLink: magicLink });

        const authSession = await getAuthSession(request);
        authSession.session.set("otp", encryptedOtp);
        authSession.session.set("email", email);
        throw redirect(options.successRedirect, {
          headers: {
            "Set-Cookie": await authSession.commit(),
          },
        });
      } else {
        const otpCode =
          parsed.data.otp || new URL(request.url).searchParams.get("code");
        if (typeof otpCode !== "string") {
          throw new AuthorizationError("Missing OTP code");
        }

        const encryptedOtpCode = await encryptOTP(otpCode);
        const totp = await this.getOTP(encryptedOtpCode);
        if (!totp || !totp.active) {
          throw new AuthorizationError("Invalid OTP code");
        }

        const payload = await verifyOTP({ otp: otpCode, payload: totp.hash });
        if (!payload) {
          throw new AuthorizationError("Invalid OTP code");
        }

        if (!(await this.deactivateOTP(totp))) {
          throw new Error("Server error: failed to deactivate OTP");
        }

        const user = await this.verify({ otp: otpCode, email: payload.email });

        return this.success(user, request, sessionStorage, options);
      }
    } catch (error: any) {
      if (error instanceof Response) {
        throw error;
      } else if (error instanceof Error) {
        return await this.failure(
          error.message,
          request,
          sessionStorage,
          options,
          error,
        );
      } else if (typeof error === "string") {
        return await this.failure(
          error,
          request,
          sessionStorage,
          options,
          new Error(error),
        );
      } else {
        return await this.failure(
          "Unknown error",
          request,
          sessionStorage,
          options,
          new Error(JSON.stringify(error, null, 2)),
        );
      }
    }
  }
}
