import { conform, useForm } from "@conform-to/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useId } from "react";
import { FormError } from "~/components/form/form-error";
import { InputWithError } from "~/components/form/input-with-error";
import { Button } from "~/components/ui/button";
import { authenticator } from "~/lib/auth/auth.server";
import { parse } from "@conform-to/zod";
import { typedAuthSessionStorage } from "~/lib/auth/session.server";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { MailCheck } from "lucide-react";
import { AuthorizationError } from "remix-auth";
import { getSubmission } from "~/lib/form";
import { createTotp, getTotp } from "~/models/totp";
import { getUserByEmailAddress } from "~/models/user";
import { encryptOTP, generateOTP } from "~/lib/otp.server";
import { getDomain } from "~/lib/misc";
import { sendEmail } from "~/lib/email.server";
import ResetPasswordTemplate from "~/components/emails/reset-password";
import { z } from "zod";
import { EmailAddress } from "~/models/email";

const ResetPasswordSchema = z.object({ email: EmailAddress });
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Parse email address
  const submission = await parse(formData, {
    schema: ResetPasswordSchema,
    async: true,
  });
  if (!submission.value) {
    return json(submission, { status: 400 });
  }
  const credentials = submission.value;

  try {
    const user = await getUserByEmailAddress(credentials.email);
    if (!user) {
      throw new Error("Server error: could not find user");
    }

    const { otp, payload } = await generateOTP({ email: credentials.email });
    const encryptedOtp = await encryptOTP(otp);
    const totp = await createTotp(encryptedOtp, payload);
    if (!totp) {
      throw new Error("Server error: failed to generate OTP code");
    }

    const verificationLink = getDomain(request, `/reset-password?code=${otp}`);
    await sendEmail({
      to: credentials.email,
      subject: "Reset your password",
      email: ResetPasswordTemplate({
        verificationLink,
        contactLink: "mailto:contact@trailer.stack",
      }),
    });

    const authSession = await typedAuthSessionStorage.getSession(
      request.headers.get("cookie"),
    );
    authSession.set("otp", encryptedOtp);
    authSession.set("email", credentials.email);
    throw redirect("/forgot-password", {
      headers: {
        "Set-Cookie": await typedAuthSessionStorage.commitSession(authSession),
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
            "": [error.message],
          },
        },
        {
          status: error.message.toLowerCase().includes("server error")
            ? 500
            : 400,
        },
      );
    } else {
      return json(getSubmission(error, formData), { status: 500 });
    }
  }
}

async function isOTPValid(otp: string) {
  const totp = await getTotp(otp);
  return !!totp && totp.active;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  const authSession = await typedAuthSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const otp = authSession.get("otp");
  return json({ otp, otpValid: !!otp && (await isOTPValid(otp)) });
}

export default function ForgotPasswordPage() {
  const { otpValid } = useLoaderData<typeof loader>();
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
        {!otpValid ? (
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
