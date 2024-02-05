import { conform, useForm } from "@conform-to/react";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useId } from "react";
import { FormError } from "~/components/form/form-error";
import { InputWithError } from "~/components/form/input-with-error";
import { Button } from "~/components/ui/button";
import { parse } from "@conform-to/zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { MailCheck } from "lucide-react";
import { AuthToken } from "~/lib/session.server";
import { getUserByEmailAddress } from "~/models/user";
import { generateTOTP } from "@epic-web/totp";
import { createTOTP } from "~/models/totp";
import { getDomain } from "~/lib/misc";
import { sendEmail } from "~/lib/email.server";
import ResetPasswordTemplate from "~/components/emails/reset-password";
import { resetCookie, setResetCookie } from "./auth/forgot/cookie";
import { ForgotPasswordSchema } from "./auth/forgot/schemas";
import {
  AuthenticationError,
  errorToStatusCode,
  errorToSubmission,
} from "~/lib/error";

export async function action({ request }: ActionFunctionArgs) {
  const token = await AuthToken.get(request);
  if (token.isAuthenticated) {
    throw redirect("/");
  }

  const formData = await request.formData();
  const submission = await parse(formData, {
    schema: ForgotPasswordSchema,
    async: true,
  });

  if (!submission.value) {
    return json(submission, { status: 400 });
  }
  const emailAddress = submission.value.email;

  const cookie = (await resetCookie.parse(request.headers.get("cookie"))) || {};

  try {
    const user = await getUserByEmailAddress(emailAddress);
    if (!user) {
      throw new AuthenticationError("USER_NOT_FOUND");
    }

    const { otp, ...payload } = generateTOTP();
    const totp = await createTOTP(payload, user.id);
    const verificationLink = getDomain(
      request,
      `/reset-password?code=${otp}&id=${totp.id}`,
    );
    await sendEmail({
      to: emailAddress,
      subject: "Reset your password",
      email: ResetPasswordTemplate({
        verificationLink,
        contactLink: "mailto:help@trailer.stack",
      }),
    });

    throw redirect("/forgot-password", {
      headers: {
        "Set-Cookie": await setResetCookie(cookie, {
          id: totp.id,
          expires: totp.expires,
          otp,
        }),
      },
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    } else {
      console.error(
        `🔴 Failed to generate token for reset password request: ${error}`,
      );
      const submissionWithError = errorToSubmission(submission, error);
      const status = errorToStatusCode(error);
      return json(submissionWithError, {
        status,
        headers: [["Set-Cookie", await resetCookie.serialize(cookie)]],
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
  const otpError = cookie.error;
  delete cookie.error;

  const hasActiveOTP =
    !!cookie.otp && !!cookie.expires && new Date() < new Date(cookie.expires);

  return json(
    { hasActiveOTP, otpError },
    {
      headers: {
        "Set-Cookie": await resetCookie.serialize(cookie),
      },
    },
  );
}

export default function ForgotPasswordPage() {
  const { hasActiveOTP } = useLoaderData<typeof loader>();
  const auth = useFetcher<typeof action>();
  const formId = useId();
  const [form, { email }] = useForm({
    id: formId,
    lastSubmission: auth.data,
    fallbackNative: true,
  });

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto">
      <section className="mt-[15vh] flex min-w-[28rem] max-w-3xl flex-col items-center rounded-xl px-8 pb-12 pt-10 shadow-lg ring-1 ring-inset ring-slate-100">
        <div className="mb-8 text-center">
          <h1 className="font-display font-semibold">Forgot Password</h1>
          <p className="muted text-xs">
            Enter the email address you registered with into the input below{" "}
            <br /> to reset your password
          </p>
        </div>
        {!hasActiveOTP ? (
          <auth.Form
            {...form.props}
            method="post"
            action="/forgot-password"
            className="w-full"
          >
            <FormError error={form.error} className="mb-4" />
            <div className="grid gap-6">
              <InputWithError
                label="Email"
                error={email.error}
                errorId={email.errorId}
                {...conform.input(email)}
              />
              <Button>Reset password</Button>
            </div>
          </auth.Form>
        ) : (
          <Alert>
            <MailCheck
              strokeWidth={2.5}
              className="h-4 w-4 stroke-emerald-600"
            />
            <AlertTitle className="small text-emerald-600">
              Check your mailbox
            </AlertTitle>
            <AlertDescription className="muted text-xs">
              A reset link with instructions has been sent to your mail box.
            </AlertDescription>
          </Alert>
        )}
        <div className="muted mt-8 text-xs">
          <Link
            to="/signin"
            className="font-medium text-slate-800 hover:underline dark:text-slate-200"
          >
            Go back
          </Link>
        </div>
      </section>
    </div>
  );
}
