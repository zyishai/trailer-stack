import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { redirectBack } from "remix-utils/redirect-back";
import { AuthorizationError } from "remix-auth";
import capitalize from "capitalize";
import { parse } from "@conform-to/zod";
import { OTPLoginSchema } from "./schema";
import { AuthToken } from "~/lib/session.server";
import { generateTOTP } from "@epic-web/totp";
import { getUserByEmailAddress } from "~/models/user";
import { createTOTP, deactivateTOTP } from "~/models/totp";
import { getDomain } from "~/lib/misc";
import { sendEmail } from "~/lib/email.server";
import TotpTemplate from "~/components/emails/totp";
import { clearOtpCookie, otpCookie, setOtpCookie } from "./cookie";

export async function action({ request }: ActionFunctionArgs) {
  const authToken = await AuthToken.get(request);
  if (authToken.isAuthenticated) {
    throw redirect("/");
  }

  const formData = await request.clone().formData();
  const submission = await parse(formData, {
    schema: OTPLoginSchema,
    async: true,
  });
  if (!submission.value) {
    return json(submission, { status: 400 });
  }

  const credentials = submission.value;

  try {
    const user = await getUserByEmailAddress(credentials.email);
    if (!user) {
      throw new AuthorizationError("User not found");
    }

    const cookie = (await otpCookie.parse(request.headers.get("cookie"))) || {};

    if (cookie?.id) {
      if (!(await deactivateTOTP(cookie.id))) {
        console.warn(
          `🟠 Failed to deactivate OTP after request to another OTP was made. OTP id: ${cookie.id}`,
        );
      }

      await clearOtpCookie(cookie);
    }

    const { otp, ...payload } = generateTOTP();
    const totp = await createTOTP(payload, user.id);
    const magicLink = getDomain(
      request,
      `/auth/totp/magic-link?code=${otp}&id=${totp.id}`,
    );
    await sendEmail({
      to: credentials.email,
      subject: "Verify your identity",
      email: TotpTemplate({
        magicLink,
        verificationCode: otp,
      }),
    });
    throw redirect("/verify-totp", {
      headers: {
        "Set-Cookie": await setOtpCookie(cookie, {
          id: totp.id,
          expires: totp.expires,
          email: totp.user.email,
        }),
      },
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    } else if (error instanceof AuthorizationError) {
      return json(
        {
          ...submission,
          error: {
            "": [capitalize(error.message.trim(), true)],
          },
        },
        {
          status: 400,
        },
      );
    } else {
      console.error(`🔴 [OTP Login] Server error: ${error}`);
      return json(
        {
          ...submission,
          error: {
            "": ["Server error: failed to generate OTP code"],
          },
        },
        { status: 500 },
      );
    }
  }
}

export async function loader({ request }: ActionFunctionArgs) {
  return redirectBack(request, { fallback: "/signin" });
}
