import { conform, useForm } from "@conform-to/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useId, useMemo } from "react";
import { InputWithError } from "~/components/form/input-with-error";
import { FormError } from "~/components/form/form-error";
import { Button } from "~/components/ui/button";
import { authenticator } from "~/lib/auth/auth.server";
import { submissionSchema } from "~/lib/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { z } from "zod";
import { authSessionStorage } from "~/lib/auth/session.server";
import { getDatabaseInstance } from "~/lib/db.server";
import { isTotpActive } from "~/models/totp";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { MailCheck } from "lucide-react";

const authMethodSchema = z.preprocess(
  method => (method === "otp" ? "totp" : method),
  z.enum(["creds", "totp"]).catch("creds"),
);

async function isValidTotp(hash: string) {
  const db = await getDatabaseInstance();
  const [valid] = await db.query<boolean>(isTotpActive, { hash });
  return valid;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  // Authentication method
  const searchParams = new URL(request.url).searchParams;
  const method = authMethodSchema.parse(searchParams.get("method"));

  // Whether user has active OTP
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const authEmail = authSession.has("auth:email")
    ? String(authSession.get("auth:email"))
    : undefined;
  const authTotp = authSession.get("auth:totp");
  let totpValid = false;
  if (authTotp) {
    totpValid = await isValidTotp(authTotp);
  }
  const sessionError = authSession.get(authenticator.sessionErrorKey);

  return json(
    { method, authEmail, totpValid, sessionError },
    {
      headers: {
        "Set-Cookie": await authSessionStorage.commitSession(authSession), // clear flash messages
      },
    },
  );
}

export default function SignInPage() {
  const { method, authEmail, totpValid, sessionError } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto">
      <section className="mt-[20vh] flex min-w-[28rem] max-w-3xl flex-col items-center rounded-xl px-8 pb-12 pt-10 shadow-lg ring-1 ring-inset ring-slate-100">
        <h1 className="mb-8 font-display font-semibold">Sign In</h1>
        <Tabs className="w-full" defaultValue={method}>
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
            {totpValid ? (
              <TotpVerifyForm email={authEmail} />
            ) : (
              <TotpSignInForm error={sessionError} />
            )}
          </TabsContent>
        </Tabs>
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
        <InputWithError
          label="Password"
          error={password.error}
          errorId={password.errorId}
          {...conform.input(password, { type: "password" })}
        />
        <Button>Login to your account</Button>
      </div>
    </auth.Form>
  );
}

function TotpSignInForm({ error }: { error?: Error }) {
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
      <FormError error={error?.message || form.error} className="mb-4" />
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
  const [form, { code }] = useForm({
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
            error={code.error}
            errorId={code.errorId}
            {...conform.input(code)}
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
