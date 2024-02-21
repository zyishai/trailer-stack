import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useId } from "react";
import { FormError } from "~/components/form/form-error";
import { InputWithError } from "~/components/form/input-with-error";
import { Button } from "~/components/ui/button";
import { findCredentialByUserId, updateCredential } from "~/models/credential";
import { ResetPasswordSchema } from "./auth/forgot/schemas";
import { AuthToken } from "~/lib/session.server";
import invariant from "tiny-invariant";
import {
  clearResetCookie,
  commitResetCookie,
  resetCookie,
} from "./auth/forgot/cookie";
import { verifyOTP } from "./auth/forgot/verify";
import { deactivateTOTP } from "~/models/totp";
import {
  errorToStatusCode,
  getClientErrorMessage,
  errorToSubmission,
  AuthorizationError,
  AuthenticationError,
} from "~/lib/error";
import { Datetime } from "~/models/datetime";
import { can } from "~/lib/authorization";
import { grantPrivilege } from "~/models/privilege";

// 1. Can change password?
//    🔴 No - Clear cookie + Access Denied
// 2. Change password
// 3. Clear cookie
// 4. Redirect back
export async function action({ request }: ActionFunctionArgs) {
  const token = await AuthToken.get(request);
  if (token.isAuthenticated) {
    throw redirect("/");
  }

  const formData = await request.formData();

  // Parse payload
  const submission = parse(formData, { schema: ResetPasswordSchema });
  if (!submission.value) {
    return json(submission);
  }

  // Change password for the user
  const { password, userId } = submission.value;

  const cookie = (await resetCookie.parse(request.headers.get("cookie"))) || {};

  try {
    if (!cookie.id) {
      console.warn(
        `🟠 Denied access to reset password to ${token.id}, TOTP id was not found in cookie`,
      );
      clearResetCookie(cookie);
      throw new AuthorizationError("ACCESS_DENIED");
    }

    const credential = await findCredentialByUserId(userId);
    const accessResponse = await can(token)
      .change("credential", ["password"])
      .with({ id: credential?.id });
    if (!accessResponse.isAllowed) {
      console.warn(
        `🟠 Unauthorized access: reset password denied to ${token.id}, tried to change password of ${userId} (${credential?.id})`,
      );
      clearResetCookie(cookie);
      throw new AuthorizationError("ACCESS_DENIED");
    }

    await updateCredential(userId, password).catch(reason => {
      clearResetCookie(cookie);
      throw reason;
    });

    if (!(await deactivateTOTP(cookie.id))) {
      console.warn(
        `🟠 Failed to deactivate OTP after request to another OTP was made. OTP id: ${cookie.id}, OTP value: ${cookie.otp}`,
      );
    }

    clearResetCookie(cookie);

    throw redirect("/signin", {
      headers: {
        "Set-Cookie": await commitResetCookie(cookie),
      },
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    } else {
      console.error(
        `🔴 Failed to change password. User id ${userId}, New password: ${password}`,
      );
      const submissionWithError = errorToSubmission(submission, error);
      const status = errorToStatusCode(error);
      return json(submissionWithError, {
        status,
        headers: { "Set-Cookie": await resetCookie.serialize(cookie) },
      });
    }
  }
}

// 1. Can read AT?
//    🔴 No - Clear cookie + Access Denied
// 2. Verify AT
//    🔴 Fail - Clear cookie + Invalid token
// 3. Grant access to change user's password
// 4. Extract user id
export async function loader({ request }: LoaderFunctionArgs) {
  const token = await AuthToken.get(request);
  if (token.isAuthenticated) {
    throw redirect("/");
  }

  const cookie = (await resetCookie.parse(request.headers.get("cookie"))) || {};

  try {
    const searchParams = new URL(request.url).searchParams;
    const otpId = searchParams.get("id");
    const otp = searchParams.get("code");
    invariant(otpId, () => {
      console.warn(
        `🟠 Invalid reset password verification link: missing OTP id (?id=...) from search parameters`,
      );
      return "Invalid verification link";
    });
    invariant(otp, () => {
      console.warn(
        `🟠 Invalid reset password verification link: missing OTP code (?code=...) from search parameters`,
      );
      return "Invalid verification link";
    });

    const accessResponse = await can(token).read("totp").with({ id: otpId });
    if (!accessResponse.isAllowed) {
      clearResetCookie(cookie);
      throw new AuthorizationError("ACCESS_DENIED");
    }

    const totp = await verifyOTP(otpId, otp, cookie);
    const credential = await findCredentialByUserId(totp.user.id);
    if (!credential) {
      throw new AuthenticationError("USER_NOT_FOUND");
    }
    const expirationTime = Datetime.safeParse(totp.expires);
    await grantPrivilege({
      type: "update",
      forId: token.id,
      toId: credential.id,
      fields: ["password"],
      expires: expirationTime.success ? expirationTime.data : undefined,
    }).catch(reason => {
      console.warn(
        `🟠 Reset password flow: failed granting permission to change password for a verified token. Reason: ${reason}`,
      );
      clearResetCookie(cookie);
      throw new AuthorizationError("GRANTING_FAILED");
    });
    return json(
      { userId: totp.user.id },
      { headers: { "Set-Cookie": await commitResetCookie(cookie) } },
    );
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    } else {
      console.error(`🔴 Reset password failed to verify token: ${error}`);
      cookie.error = getClientErrorMessage(error);
      throw redirect("/signin?method=creds", {
        headers: { "Set-Cookie": await commitResetCookie(cookie) },
      });
    }
  }
}

export default function ResetPasswordPage() {
  const { userId } = useLoaderData<typeof loader>();
  const auth = useFetcher<typeof action>();
  const formId = useId();
  const [form, { password, confirm }] = useForm({
    id: formId,
    lastSubmission: auth.data,
    fallbackNative: true,
  });

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto">
      <section className="mt-[15vh] flex min-w-[28rem] max-w-3xl flex-col items-center rounded-xl px-8 pb-12 pt-10 shadow-lg ring-1 ring-inset ring-slate-100">
        <div className="mb-8 text-center">
          <h1 className="font-display font-semibold">Reset Password</h1>
          <p className="muted text-xs">Create new password.</p>
        </div>

        <auth.Form
          {...form.props}
          method="post"
          action="/reset-password"
          className="w-full"
        >
          <FormError error={form.error} className="mb-4" />
          <input type="hidden" name="userId" value={userId} />
          <div className="grid gap-6">
            <InputWithError
              type="password"
              label="New assword"
              error={password.error}
              errorId={password.errorId}
              {...conform.input(password)}
            />
            <InputWithError
              type="password"
              label="Confirm new password"
              error={confirm.error}
              errorId={confirm.errorId}
              {...conform.input(confirm)}
            />
            <Button>Reset password</Button>
          </div>
        </auth.Form>
      </section>
    </div>
  );
}
