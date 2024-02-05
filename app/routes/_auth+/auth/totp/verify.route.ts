import { parse } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { TOTPVerifySchema } from "./schema";
import { AuthToken } from "~/lib/session.server";
import { clearOtpCookie, otpCookie } from "./cookie";
import { verifyOTP } from "./verify";
import { errorToStatusCode, errorToSubmission } from "~/lib/error";

export async function action({ request }: ActionFunctionArgs) {
  const token = await AuthToken.get(request);
  if (token.isAuthenticated) {
    throw redirect("/");
  }

  const formData = await request.clone().formData();
  const submission = parse(formData, { schema: TOTPVerifySchema });
  if (!submission.value) {
    return json(submission, { status: 400 });
  }

  const data = submission.value;
  const cookie = (await otpCookie.parse(request.headers.get("cookie"))) || {};

  try {
    const totp = await verifyOTP(data.id, data.otp, cookie);

    return await token.upgrade({
      userId: totp.user.id,
      redirectTo: "/",
      headers: new Headers([["Set-Cookie", await clearOtpCookie(cookie)]]),
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    } else {
      console.error(`🔴 Failed to verify OTP: ${error}`);
      const submissionWithError = errorToSubmission(submission, error);
      const status = errorToStatusCode(error);
      return json(submissionWithError, {
        status,
        headers: [["Set-Cookie", await otpCookie.serialize(cookie)]],
      });
    }
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect("/signin?method=totp");
}
