import { parse } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { AuthorizationError } from "remix-auth";
import { redirectBack } from "remix-utils/redirect-back";
import { Strategies, authenticator } from "~/lib/auth/auth.server";
import { TOTPVerifySchema } from "~/lib/auth/strategies/totp/schema";
import { getSubmission } from "~/lib/form";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.clone().formData();

  const submission = await parse(formData, {
    schema: TOTPVerifySchema,
    async: true,
  });
  if (!submission.value) {
    return json(submission, { status: 400 });
  }

  try {
    return await authenticator.authenticate(Strategies.TOTP, request, {
      successRedirect: "/",
      throwOnError: true,
      context: { otp: submission.value.otp },
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    } else if (error instanceof AuthorizationError) {
      return json(
        {
          ...submission,
          error: {
            "": [error.message],
          },
        },
        {
          status: error.message.toLowerCase().includes("server error")
            ? 500
            : 400,
        },
      );
    } else {
      return json(getSubmission(error, formData), { status: 500 });
    }
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  return redirectBack(request, { fallback: "/signin?method=totp" });
}
