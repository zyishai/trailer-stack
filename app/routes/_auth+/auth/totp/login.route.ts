import { parse } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { redirectBack } from "remix-utils/redirect-back";
import { z } from "zod";
import { Strategies, authenticator } from "~/lib/auth/auth.server";
import { getSubmission } from "~/lib/form";

const emailSchema = z.object({
  email: z.string().email(),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.clone().formData();
  const submission = parse(formData, { schema: emailSchema });
  if (!submission.value) {
    return json(submission);
  }

  try {
    return await authenticator.authenticate(Strategies.TOTP, request, {
      successRedirect: "/signin?method=totp",
      throwOnError: true,
      context: { formData },
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    } else {
      const submission = getSubmission(error, formData);
      return json(submission);
    }
  }
}

export async function loader({ request }: ActionFunctionArgs) {
  return redirectBack(request, { fallback: "/signin" });
}
