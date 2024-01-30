import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useId } from "react";
import { FormError } from "~/components/form/form-error";
import { InputWithError } from "~/components/form/input-with-error";
import { Button } from "~/components/ui/button";
import { updateCredential } from "~/models/credential";
import { ResetPasswordSchema } from "./auth/forgot/schemas";
import { AuthToken } from "~/lib/session.server";
import invariant from "tiny-invariant";
import { clearResetCookie, resetCookie } from "./auth/forgot/cookie";
import { verifyOTP } from "./auth/forgot/verify";
import { AuthorizationError } from "remix-auth";
import { deactivateTOTP } from "~/models/totp";

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
  const { password } = submission.value;

  const cookie = (await resetCookie.parse(request.headers.get("cookie"))) || {};

  try {
    if (!cookie.id || !cookie.otp || !cookie.userId) {
      throw redirect("/");
    }

    await updateCredential(cookie.userId, password);

    if (!(await deactivateTOTP(cookie.id))) {
      console.warn(
        `🟠 Failed to deactivate OTP after request to another OTP was made. OTP id: ${cookie.id}, OTP value: ${cookie.otp}`,
      );
    }

    throw redirect("/signin", {
      headers: {
        "Set-Cookie": await clearResetCookie(cookie),
      },
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    } else {
      console.error(
        `🔴 Failed to change password. User id ${cookie.userId}, New password: ${password}`,
      );
      return json({
        ...submission,
        error: {
          "": ["Unknown server error "],
        },
      });
    }
  }
}

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

    const totp = await verifyOTP(otpId, otp, cookie);
    cookie.userId = totp.user.id;
    return json(
      {
        userId: totp.user.id,
      },
      {
        headers: {
          "Set-Cookie": await resetCookie.serialize(cookie),
        },
      },
    );
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    } else {
      cookie.error =
        error instanceof AuthorizationError
          ? error.message
          : "Unknown server error";
      throw redirect("/signin?method=creds", {
        headers: {
          "Set-Cookie": await resetCookie.serialize(cookie),
        },
      });
    }
  }
}

export default function ResetPasswordPage() {
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
