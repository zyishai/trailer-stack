import { parse } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { redirectBack } from "remix-utils/redirect-back";
import { z } from "zod";
import { Strategies, authenticator } from "~/lib/auth/auth.server";
import { getSubmission } from "~/lib/form";

const codeSchema = z.object({
  code: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.clone().formData();

  const submission = parse(formData, { schema: codeSchema });
  if (!submission.value) {
    return json(submission);
  }

  try {
    return await authenticator.authenticate(Strategies.TOTP, request, {
      successRedirect: "/",
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

export async function loader({ request }: LoaderFunctionArgs) {
  return redirectBack(request, { fallback: "/signin?method=totp" });
}
