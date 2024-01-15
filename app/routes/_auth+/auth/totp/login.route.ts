import { parse } from "@conform-to/zod";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { AuthorizationError } from "remix-auth";
import { redirectBack } from "remix-utils/redirect-back";
import { Strategies, authenticator } from "~/lib/auth/auth.server";
import { TOTPLoginSchema } from "~/lib/auth/strategies/totp/schema";

export async function action({ request }: ActionFunctionArgs) {
  await authenticator.isAuthenticated(request, { successRedirect: "/" });

  const formData = await request.clone().formData();
  const submission = await parse(formData, {
    schema: TOTPLoginSchema,
    async: true,
  });
  if (!submission.value) {
    return json(submission, { status: 400 });
  }

  const credentials = submission.value;

  try {
    await authenticator.authenticate(Strategies.TOTP, request, {
      successRedirect: "/signin?method=totp",
      throwOnError: true,
      context: {
        email: credentials.email,
      },
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
      console.error(`🚨 [OTP Login] Server error: ${error}`);
      return json(
        {
          ...submission,
          error: {
            "": ["Server error: failed to generate OTP code"],
          },
        },
        { status: 500 },
      );
    }
  }
}

export async function loader({ request }: ActionFunctionArgs) {
  return redirectBack(request, { fallback: "/signin" });
}
