import { conform, useForm } from "@conform-to/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useId, useMemo } from "react";
import { InputWithError } from "~/components/form/input-with-error";
import { FormError } from "~/components/form/form-error";
import { Button } from "~/components/ui/button";
import { authenticator } from "~/lib/auth/auth.server";
import { submissionSchema } from "~/lib/form";

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export default function SignInPage() {
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
    <div className="flex h-full flex-col items-center justify-center">
      <section className="flex min-w-[28rem] max-w-3xl flex-col items-center rounded-xl px-8 pb-12 pt-10 shadow-lg ring-1 ring-inset ring-slate-100">
        <h1 className="mb-8 font-display font-semibold">Sign In</h1>
        <auth.Form
          {...form.props}
          method="post"
          action="/auth/creds/login"
          className="w-full"
        >
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
      </section>
    </div>
  );
}
