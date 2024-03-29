import { conform, useForm } from "@conform-to/react";
import { Link, useFetcher } from "@remix-run/react";
import { useId } from "react";
import { Button } from "~/components/ui/button";
import { FormError } from "~/components/form/form-error";
import { InputWithError } from "~/components/form/input-with-error";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { AuthToken } from "~/lib/session.server";
import { action } from "./auth/creds/register.route";

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await AuthToken.get(request);
  if (token.isAuthenticated) {
    throw redirect("/");
  }

  return null;
}

export default function SignUpPage() {
  const auth = useFetcher<typeof action>();
  const formId = useId();
  const [form, { username, email, password }] = useForm({
    id: formId,
    lastSubmission: auth.data,
    fallbackNative: true,
  });

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto">
      <section className="mt-[15vh] flex min-w-[28rem] max-w-3xl flex-col items-center rounded-xl px-8 pb-12 pt-10 shadow-lg ring-1 ring-inset ring-slate-100">
        <h1 className="mb-8 font-display font-semibold">Sign Up</h1>
        <auth.Form
          {...form.props}
          method="post"
          action="/auth/creds/register"
          className="w-full"
        >
          <FormError error={form.error} className="mb-4" />
          <input type="hidden" name="intent" value="register" />
          <div className="grid gap-6">
            <div className="flex items-start gap-6">
              <InputWithError
                label="Username"
                error={username.error}
                errorId={username.errorId}
                {...conform.input(username)}
              />
              <InputWithError
                label="Email"
                error={email.error}
                errorId={email.errorId}
                {...conform.input(email, { type: "email" })}
              />
            </div>
            <InputWithError
              label="Password"
              error={password.error}
              errorId={password.errorId}
              {...conform.input(password, { type: "password" })}
            />
            <Button>Create account</Button>
          </div>
        </auth.Form>
        <div className="muted mt-8 text-xs">
          Already a member?{" "}
          <Link
            to="/signin"
            className="font-medium text-slate-800 hover:underline dark:text-slate-200"
          >
            Login
          </Link>
        </div>
      </section>
    </div>
  );
}
