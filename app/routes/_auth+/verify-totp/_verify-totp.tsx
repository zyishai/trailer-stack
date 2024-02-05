import { useState } from "react";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { AuthToken } from "~/lib/session.server";
import { otpCookie } from "../auth/totp/cookie";
import OtpInput from "react-otp-input";
import { cn } from "~/lib/misc";
import { useForm } from "@conform-to/react";
import { action } from "../auth/totp/verify.route";
import { FormError } from "~/components/form/form-error";
import { useCountdown } from "./use-countdown";

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await AuthToken.get(request);
  if (token.isAuthenticated) {
    throw redirect("/");
  }

  const cookie = (await otpCookie.parse(request.headers.get("cookie"))) || {};
  if (!cookie.id) {
    throw redirect("/");
  }

  return json({ id: cookie.id, expires: cookie.expires, email: cookie.email });
}

export default function ValidateTotpPage() {
  const { id, expires, email } = useLoaderData<typeof loader>();
  const resend = useFetcher();
  const countdown = useCountdown({ expirationTime: expires });

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto">
      <section className="mt-[15vh] flex min-w-[28rem] max-w-3xl flex-col items-center rounded-xl px-8 pb-12 pt-10 shadow-lg ring-1 ring-inset ring-slate-100">
        <h1 className="font-display font-semibold">Enter Code</h1>
        <p className="muted">
          We have sent to your provided email a 6 digits code
        </p>
        <div className="mt-10">
          <OneTimePasswordForm otpId={id} />
        </div>
        <div className="my-4">
          <p className="small muted">
            Code will expire in {countdown.prettyPrint({ noHours: true })}
          </p>
        </div>
        <Button form="verify">Submit</Button>
        <div className="mt-8 flex flex-col items-center">
          <p className="small font-normal">Did not receive the code?</p>
          <resend.Form method="POST" action="/auth/totp/login">
            <input type="hidden" name="email" value={email} />
            <Button
              variant="link"
              className="underline"
              disabled={resend.state === "submitting"}
            >
              {resend.state === "submitting" ? "Sending..." : "Resend Code"}
            </Button>
          </resend.Form>
        </div>
      </section>
    </div>
  );
}

function OneTimePasswordForm({ otpId }: { otpId: string }) {
  const [code, setCode] = useState("");
  const fetch = useFetcher<typeof action>();
  const [form] = useForm({ lastSubmission: fetch.data, fallbackNative: true });

  return (
    <fetch.Form
      id="verify"
      method="POST"
      action="/auth/totp/verify"
      {...form.props}
    >
      <FormError error={form.error} className="mb-2" />
      <input type="hidden" name="id" value={otpId} />
      <input type="hidden" name="otp" value={code} />
      <OtpInput
        value={code}
        onChange={setCode}
        numInputs={6}
        containerStyle="!grid grid-cols-6 gap-6 !items-stretch h-20"
        renderInput={({ className, type, inputMode, style, ...props }) => (
          <input
            type={type}
            inputMode="text"
            maxLength={1}
            className={cn(
              className,
              "rounded-md bg-slate-200 text-center text-xl dark:bg-slate-800",
            )}
            {...props}
          />
        )}
        skipDefaultStyles
      />
    </fetch.Form>
  );
}
