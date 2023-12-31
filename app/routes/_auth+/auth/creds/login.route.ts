// This is a resource route.
// POSTing to this route should sign in the user (if credentials are valid)

import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { Strategies, authenticator } from "~/lib/auth/auth.server";
import { getSubmission } from "~/lib/form";

// GETing this route should redirect back to /signin
export const action = (async ({ request }) => {
  const formData = await request.formData();

  try {
    return await authenticator.authenticate(Strategies.Credentials, request, {
      successRedirect: "/",
      throwOnError: true,
      context: { formData },
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error; // This is a success redirect, safe to throw :)
    } else {
      const submission = getSubmission(error, formData);
      return json(submission);
    }
  }
}) satisfies ActionFunction;

export const loader = (async () => {
  return redirect("/signin");
}) satisfies LoaderFunction;
