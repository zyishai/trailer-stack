// This is a resource route.
// POSTing to this route should sign in the user (if credentials are valid)

import { parse } from "@conform-to/zod";
import {
  type ActionFunction,
  type LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { signin } from "./signin";
import { LoginSchema } from "./schemas";
import { AuthToken } from "~/lib/session.server";
import {
  AuthenticationError,
  errorToStatusCode,
  errorToSubmission,
} from "~/lib/error";

export const action = (async ({ request }) => {
  const authToken = await AuthToken.get(request);
  if (authToken.isAuthenticated) {
    throw redirect("/");
  }

  const formData = await request.formData();
  const submission = await parse(formData, {
    schema: LoginSchema,
    async: true,
  });
  if (!submission.value) {
    return json(submission, { status: 400 });
  }

  const credentials = submission.value;

  try {
    // Verify credentials and fetch user data
    const user = await signin(credentials.username, credentials.password);
    if (!user) {
      console.error(
        `🔴 Failed to sign in with credentials: ${JSON.stringify(
          credentials,
          null,
          2,
        )}. Expected: user object, Got: ${user}`,
      );
      throw new AuthenticationError("CREDS_INVALID");
    }

    return await authToken.upgrade({
      userId: user.id,
      redirectTo: "/",
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error; // This is a redirect, safe to throw :)
    } else {
      console.error(`🔴 Login failed: ${error}`);
      const submissionWithError = errorToSubmission(submission, error);
      const status = errorToStatusCode(error);
      return json(submissionWithError, { status });
    }
  }
}) satisfies ActionFunction;

export const loader = (async () => {
  return redirect("/signin");
}) satisfies LoaderFunction;
