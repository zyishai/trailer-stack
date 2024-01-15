// This is a resource route.
// POSTing to this route should create new user (if not exist)
// GETing this route should redirect back to /signin

import { parse } from "@conform-to/zod";
import {
  type ActionFunction,
  type LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { AuthorizationError } from "remix-auth";
import { Strategies, authenticator } from "~/lib/auth/auth.server";
import { RegisterSchema } from "~/lib/auth/strategies/creds/schema";
import { getSubmission } from "~/lib/form";

export const action = (async ({ request }) => {
  const formData = await request.formData();
  const submission = await parse(formData, {
    schema: RegisterSchema,
    async: true,
  });
  if (!submission.value) {
    return json(submission, {
      status: 400,
    });
  }

  const credentials = submission.value;

  try {
    return await authenticator.authenticate(Strategies.Credentials, request, {
      successRedirect: "/",
      throwOnError: true,
      context: { formData, credentials },
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error; // This is a redirect, safe to forward :)
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
}) satisfies ActionFunction;

export const loader = (async () => {
  return redirect("/signup");
}) satisfies LoaderFunction;
