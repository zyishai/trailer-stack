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
import { AuthorizationError } from "remix-auth";
import { z } from "zod";
import { FormError } from "~/components/form/form-error";
import { InputWithError } from "~/components/form/input-with-error";
import { Button } from "~/components/ui/button";
import { authenticator } from "~/lib/auth/auth.server";
import { typedAuthSessionStorage } from "~/lib/auth/session.server";
import { encryptOTP, verifyOTP } from "~/lib/otp.server";
import { updateCredential } from "~/models/credential";
import { Password } from "~/models/password";
import { deleteTotp, getTotp, updateTotp } from "~/models/totp";
import { getUserByEmailAddress } from "~/models/user";

const ResetPasswordSchema = z
  .object({
    userId: z.string().startsWith("user:"),
    password: Password,
    confirm: Password,
  })
  .superRefine(({ password, confirm }, ctx) => {
    if (password !== confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirm"],
      });
    }
  });
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Parse payload
  const submission = parse(formData, { schema: ResetPasswordSchema });
  if (!submission.value) {
    return json(submission);
  }

  // Change password for the user
  const { userId, password } = submission.value;
  const credential = await updateCredential(userId, password);
  if (!credential) {
    console.warn(
      `⚠️ Failed to update user credentials: ${JSON.stringify(
        { userId, password },
        null,
        2,
      )}`,
    );
    return json(
      {
        ...submission,
        error: {
          "": ["Failed to update password"],
        },
      },
      { status: 500 },
    );
  }

  const authSession = await typedAuthSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  authSession.unset("auth:error");
  authSession.unset("email");
  authSession.unset("otp");
  authSession.unset("user");

  // Redirect to /signin
  throw redirect("/signin", {
    headers: {
      "Set-Cookie": await typedAuthSessionStorage.commitSession(authSession),
    },
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Redirect signed-in users
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  // Parse params
  const otp = new URL(request.url).searchParams.get("code");
  if (!otp) {
    throw new AuthorizationError("Invalid OTP code");
  }

  const encryptedOtp = await encryptOTP(otp);
  const totp = await getTotp(encryptedOtp);
  if (!totp || !totp.active) {
    throw new AuthorizationError("Invalid OTP code");
  }

  const payload = await verifyOTP({ otp, payload: totp.hash });
  if (!payload) {
    throw new AuthorizationError("Invalid OTP code");
  }

  await updateTotp(totp.id, { active: false });
  await deleteTotp(totp.id);

  const user = await getUserByEmailAddress(payload.email);
  if (!user) {
    throw new Error("Server error: could not find user");
  }

  const authSession = await typedAuthSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  authSession.unset("otp");
  authSession.unset("email");
  authSession.unset("user");
  authSession.unset("auth:error");

  return json(
    { otp, userId: user.id },
    {
      headers: {
        "Set-Cookie": await typedAuthSessionStorage.commitSession(authSession),
      },
    },
  );
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
              label="Password"
              error={password.error}
              errorId={password.errorId}
              {...conform.input(password)}
            />
            <InputWithError
              label="Confirm password"
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
