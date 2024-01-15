import { conform, useForm } from "@conform-to/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useId, useMemo } from "react";
import { InputWithError } from "~/components/form/input-with-error";
import { FormError } from "~/components/form/form-error";
import { Button } from "~/components/ui/button";
import { authenticator, generateWebauthnOptions } from "~/lib/auth/auth.server";
import { submissionSchema } from "~/lib/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { z } from "zod";
import {
  authenticatorSessionKeys,
  typedAuthSessionStorage,
} from "~/lib/auth/session.server";
import { getTotp } from "~/models/totp";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { MailCheck } from "lucide-react";
import {
  browserSupportsWebAuthn,
  handleFormSubmit,
} from "~/lib/auth/strategies/authn/helpers";
import type { WebAuthnOptionsResponse } from "remix-auth-webauthn";
import { Label } from "~/components/ui/label";

const AuthMethodSchema = z.preprocess(
  method => (method === "otp" ? "totp" : method),
  z.enum(["creds", "totp", "authn"]).catch("creds"),
);

async function isValidTotp(otp: string) {
  const totp = await getTotp(otp);
  return !!totp && totp.active;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  // Authentication method
  const searchParams = new URL(request.url).searchParams;
  const method = AuthMethodSchema.parse(searchParams.get("method"));

  // Whether user has active OTP
  const authSession = await typedAuthSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const authEmail = authSession.get("email");
  const authOtp = authSession.get("otp");
  let totpValid = false;
  if (authOtp && authEmail) {
    totpValid = await isValidTotp(authOtp);
  }
  const sessionError = authSession.get(
    authenticatorSessionKeys.sessionErrorKey,
  );

  // WebAuthn Options
  const optionsResponse = await generateWebauthnOptions(request, null);
  const webauthnOptions = await optionsResponse.json();

  return json(
    { method, authEmail, totpValid, sessionError, webauthnOptions },
    {
      headers: optionsResponse.headers,
    },
  );
}

export default function SignInPage() {
  const { method, authEmail, totpValid, sessionError, webauthnOptions } =
    useLoaderData<typeof loader>();
  const webauthnSupported =
    typeof document !== "undefined" ? browserSupportsWebAuthn() : true;

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto">
      <section className="mt-[15vh] flex min-w-[28rem] max-w-3xl flex-col items-center rounded-xl px-8 pb-12 pt-10 shadow-lg ring-1 ring-inset ring-slate-100">
        <h1 className="font-display font-semibold">Sign In</h1>
        <Tabs
          className="mt-8 w-full"
          defaultValue={
            webauthnSupported || method !== "authn" ? method : "creds"
          }
        >
          <TabsList className="mb-6 flex w-full">
            <TabsTrigger className="flex-1" value="creds">
              Credentials
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="totp">
              OTP
            </TabsTrigger>
            {webauthnSupported ? (
              <TabsTrigger className="flex-1" value="authn">
                Passkey
              </TabsTrigger>
            ) : null}
          </TabsList>
          <TabsContent value="creds">
            <CredentialsSignInForm />
          </TabsContent>
          <TabsContent value="totp">
            {totpValid ? (
              <TotpVerifyForm email={authEmail || undefined} />
            ) : (
              <TotpSignInForm error={sessionError || undefined} />
            )}
          </TabsContent>
          {webauthnSupported ? (
            <TabsContent value="authn">
              <WebAuthnSignInForm options={webauthnOptions} />
            </TabsContent>
          ) : null}
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
  const auth = useFetcher();
  const submission = useMemo(
    () => (auth.data ? submissionSchema.parse(auth.data) : undefined),
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
      <FormError error={form.error} className="mb-4" />
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

function TotpSignInForm({ error }: { error?: { message: string } }) {
  console.warn("Session error:", error?.message);
  const auth = useFetcher();
  const submission = useMemo(
    () => (auth.data ? submissionSchema.parse(auth.data) : undefined),
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
      <FormError error={form.error} className="mb-4" />
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

function TotpVerifyForm({ email }: { email?: string }) {
  const auth = useFetcher();
  const formId = useId();
  const submission = useMemo(
    () => (auth.data ? submissionSchema.parse(auth.data) : undefined),
    [auth.data],
  );
  const [form, { otp }] = useForm({
    id: formId,
    lastSubmission: submission,
    fallbackNative: true,
  });
  const refresh = useFetcher();
  const isRefreshing = refresh.state === "submitting";

  return (
    <>
      <auth.Form
        {...form.props}
        method="post"
        action="/auth/totp/verify"
        className="w-full"
      >
        {submission ? (
          <FormError error={form.error} className="mb-4" />
        ) : (
          <Alert className="mb-6">
            <MailCheck
              strokeWidth={2.5}
              className="h-4 w-4 stroke-emerald-600"
            />
            <AlertTitle className="small text-emerald-600">
              Check your mailbox
            </AlertTitle>
            <AlertDescription className="muted text-xs">
              Check your mail box for the OTP code <br /> and enter it in the
              input below to complete sign in.
            </AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6">
          <InputWithError
            label="Enter OTP code"
            error={otp.error}
            errorId={otp.errorId}
            {...conform.input(otp)}
          />
          <Button disabled={isRefreshing || auth.state === "submitting"}>
            Submit
          </Button>
        </div>
      </auth.Form>
      <refresh.Form method="post" action="/auth/totp/login" className="mt-4">
        <input type="hidden" name="email" value={email} />
        <Button variant="link" className="w-full" disabled={isRefreshing}>
          {isRefreshing ? "Requesting new code..." : "Request new code"}
        </Button>
      </refresh.Form>
    </>
  );
}

function WebAuthnSignInForm({ options }: { options: WebAuthnOptionsResponse }) {
  const auth = useFetcher();

  return (
    <auth.Form
      onSubmit={handleFormSubmit(options)}
      method="post"
      action="/auth/authn/login"
      className="w-full"
    >
      <Button name="intent" value="authentication" className="w-full">
        Sign-in with device/passkey
      </Button>
    </auth.Form>
  );
}
