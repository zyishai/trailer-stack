import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormError } from "~/components/form/form-error";
import {
  ReCaptcha,
  type ReCaptchaResponse,
  scriptHandle,
} from "~/components/recaptcha";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";

export const handle = scriptHandle;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const endpoint = process.env.CONTACT_FORM_ENDPOINT;

  const token = formData.get("g-recaptcha-response")?.toString() ?? "";
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  const response = (await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "post",
      body,
    },
  ).then(res => res.json())) as ReCaptchaResponse;

  if (response.success) {
    const res = await fetch(endpoint, { method: "post", body: formData });
    throw redirect(res.redirected ? res.url : ".");
  } else {
    return json({ error: "Invalid ReCaptcha" });
  }
}

export async function loader() {
  return json({ recaptchaKey: process.env.RECAPTCHA_CLIENT_KEY });
}

export default function ContactPage() {
  const { recaptchaKey } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    formRef.current?.reset();
  }, []);

  return (
    <div className="flex h-full flex-col overflow-auto px-8 py-4 lg:pr-32">
      <h1>Contact Us</h1>
      <Separator className="mb-16 mt-4 h-1.5 w-28 bg-sky-700" />
      <div className="flex flex-1 flex-col gap-20 lg:flex-row">
        <div className="w-full lg:max-w-md">
          <FormError error={actionData?.error} className="mb-3" />
          <form
            method="post"
            className="grid grid-cols-2 gap-4"
            ref={formRef}
            onSubmit={() => setIsSubmitting(true)}
          >
            <Input
              required
              aria-required="true"
              name="name"
              placeholder="Your name *"
              className="bg-white dark:bg-slate-800"
            />
            <Input
              name="email"
              placeholder="Email address"
              className="bg-white dark:bg-slate-800"
            />
            <Input
              name="subject"
              placeholder="Subject *"
              required
              aria-required="true"
              className="col-span-2 bg-white dark:bg-slate-800"
            />
            <Textarea
              name="message"
              placeholder="Message *"
              rows={8}
              required
              aria-required="true"
              className="col-span-2 bg-white dark:bg-slate-800"
            />
            <ReCaptcha clientKey={recaptchaKey} className="col-span-2 h-20" />
            <Button disabled={isSubmitting} className="col-span-2">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
        <div className="relative hidden max-h-[640px] max-w-3xl flex-1 lg:block">
          <iframe
            width="100%"
            height="100%"
            className="absolute inset-0 opacity-40 contrast-125 backdrop-grayscale"
            title="map"
            src="https://maps.google.com/maps?width=100%&amp;height=600&amp;hl=en&amp;q=%C4%B0zmir+(My%20Business%20Name)&amp;ie=UTF8&amp;t=&amp;z=14&amp;iwloc=B&amp;output=embed"
          ></iframe>
          <div className="absolute bottom-6 left-6 inline-flex flex-wrap rounded border bg-white py-6 shadow-md">
            <div className="flex flex-col gap-2 px-6">
              <h2 className="small text-xs uppercase">ADDRESS</h2>
              <p className="muted !m-0">Remix street 54, React, PO 223906</p>
            </div>
            <div className="mt-8 px-6 lg:mt-0">
              <div className="grid gap-2">
                <h2 className="small text-xs uppercase">EMAIL</h2>
                <p className="muted !m-0">example@email.com</p>
              </div>
              <div className="mt-4 grid gap-2">
                <h2 className="small text-xs uppercase">PHONE</h2>
                <p className="muted !m-0">123-456-7890</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
