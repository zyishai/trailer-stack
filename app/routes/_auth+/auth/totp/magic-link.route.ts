import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { AuthToken } from "~/lib/session.server";
import { clearOtpCookie, otpCookie } from "./cookie";
import invariant from "tiny-invariant";
import { verifyOTP } from "./verify";

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await AuthToken.get(request);
  if (token.isAuthenticated) {
    throw redirect("/");
  }

  const searchParams = new URL(request.url).searchParams;
  const id = searchParams.get("id");
  const otp = searchParams.get("code");
  invariant(id, () => {
    console.warn(
      `🟠 Invalid OTP magic link: missing OTP id (?id=...) from search parameters`,
    );
    return "Invalid verification link";
  });
  invariant(otp, () => {
    console.warn(
      `🟠 Invalid OTP magic link: missing OTP value (?code=...) from search parameters`,
    );
    return "Invalid verification link";
  });

  const cookie = (await otpCookie.parse(request.headers.get("cookie"))) || {};

  try {
    const totp = await verifyOTP(id, otp, cookie);
    return await token.upgrade({
      userId: totp.user.id,
      redirectTo: "/",
      headers: new Headers([["Set-Cookie", await clearOtpCookie(cookie)]]),
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    } else {
      console.error(`🔴 Failed to authenticate OTP via magic link: ${error}`);
      cookie.error = error.message;
      throw redirect("/signin?method=totp", {
        headers: {
          "Set-Cookie": await otpCookie.serialize(cookie),
        },
      });
    }
  }
}
