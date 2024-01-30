import { conform, useForm } from "@conform-to/react";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useId, useMemo } from "react";
import { InputWithError } from "~/components/form/input-with-error";
import { FormError } from "~/components/form/form-error";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { z } from "zod";
import { Label } from "~/components/ui/label";
import { AuthToken } from "~/lib/session.server";
import { otpCookie } from "./auth/totp/cookie";
import { resetCookie } from "./auth/forgot/cookie";
import { SubmissionSchema } from "~/models/submission";

const AuthMethodSchema = z.preprocess(
  method => (method === "otp" ? "totp" : method),
  z.enum(["creds", "totp"]).catch("creds"),
);

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await AuthToken.get(request);
  if (token.isAuthenticated) {
    throw redirect("/");
  }

  // Authentication method
  const searchParams = new URL(request.url).searchParams;
  const method = AuthMethodSchema.parse(searchParams.get("method"));

  // Read OTP cookie error, if exists
  const cookieOtp =
    (await otpCookie.parse(request.headers.get("cookie"))) || {};
  const cookieReset =
    (await resetCookie.parse(request.headers.get("cookie"))) || {};
  const otpError = cookieOtp.error;
  const resetError = cookieReset.error;
  delete cookieOtp.error;
  delete cookieReset.error;

  return json(
    { method, otpError, resetError },
    {
      headers: [
        ["Set-Cookie", await otpCookie.serialize(cookieOtp)],
        ["Set-Cookie", await resetCookie.serialize(cookieReset)],
      ],
    },
  );
}

export default function SignInPage() {
  const { method } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto">
      <section className="mt-[15vh] flex min-w-[28rem] max-w-3xl flex-col items-center rounded-xl px-8 pb-12 pt-10 shadow-lg ring-1 ring-inset ring-slate-100">
        <h1 className="font-display font-semibold">Sign In</h1>
        <Tabs className="mt-8 w-full" defaultValue={method}>
          <TabsList className="mb-6 flex w-full">
            <TabsTrigger className="flex-1" value="creds">
              Credentials
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="totp">
              OTP
            </TabsTrigger>
          </TabsList>
          <TabsContent value="creds">
            <CredentialsSignInForm />
          </TabsContent>
          <TabsContent value="totp">
            <TotpSignInForm />
          </TabsContent>
        </Tabs>
        <div className="muted mt-8 text-xs">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-slate-800 hover:underline dark:text-slate-200"
          >
            Register
          </Link>
        </div>
      </section>
    </div>
  );
}

function CredentialsSignInForm() {
  const { resetError } = useLoaderData<typeof loader>();
  const auth = useFetcher();
  const submission = useMemo(
    () => (auth.data ? SubmissionSchema.parse(auth.data) : undefined),
    [auth.data],
  );
  const formId = useId();
  const [form, { username, password }] = useForm({
    id: formId,
    lastSubmission: submission,
    fallbackNative: true,
  });

  return (
    <auth.Form {...form.props} method="post" action="/auth/creds/login">
      <FormError error={form.error || resetError} className="mb-4" />
      <input type="hidden" name="intent" value="login" />{" "}
      {/* Very important! Otherwise, it'll fallback to "register" */}
      <div className="grid gap-6">
        <InputWithError
          label="Username"
          error={username.error}
          errorId={username.errorId}
          {...conform.input(username)}
        />
        <div className="grid gap-1">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor={password.id}>Password</Label>
            <Link to="/forgot-password" className="muted text-xs">
              Forgot your password?
            </Link>
          </div>
          <InputWithError
            error={password.error}
            errorId={password.errorId}
            {...conform.input(password, { type: "password" })}
          />
        </div>
        <Button>Login to your account</Button>
      </div>
    </auth.Form>
  );
}

function TotpSignInForm() {
  const { otpError } = useLoaderData<typeof loader>();
  const auth = useFetcher();
  const submission = useMemo(
    () => (auth.data ? SubmissionSchema.parse(auth.data) : undefined),
    [auth.data],
  );
  const formId = useId();
  const [form, { email }] = useForm({
    id: formId,
    lastSubmission: submission,
    fallbackNative: true,
  });
  const loading = auth.state === "submitting";

  return (
    <auth.Form
      {...form.props}
      method="post"
      action="/auth/totp/login"
      className="w-full"
    >
      <FormError error={form.error || otpError} className="mb-4" />
      <div className="grid gap-6">
        <InputWithError
          label="Email"
          error={email.error}
          errorId={email.errorId}
          {...conform.input(email, { type: "email" })}
        />
        <Button disabled={loading}>
          {loading ? "Generating..." : "Get code"}
        </Button>
      </div>
    </auth.Form>
  );
}
