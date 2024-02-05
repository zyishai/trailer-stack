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
import { RegisterSchema } from "./schemas";
import { signup } from "./signup";
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
    schema: RegisterSchema,
    async: true,
  });
  if (!submission.value) {
    return json(submission, { status: 400 });
  }

  const credentials = submission.value;

  try {
    const { username, password, email } = credentials;
    const user = await signup(username, password, email);
    if (!user) {
      console.error(
        `🚨 Failed to sign up with credentials: ${JSON.stringify(
          credentials,
          null,
          2,
        )}. Expected: user object, Got: ${user}`,
      );
      throw new AuthenticationError("CREDS_TAKEN");
    }

    return await authToken.upgrade({
      userId: user.id,
      redirectTo: "/",
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error; // This is a redirect, safe to forward :)
    } else {
      console.error(`🔴 Registration failed: ${error}`);
      const submissionWithError = errorToSubmission(submission, error);
      const status = errorToStatusCode(error);
      return json(submissionWithError, { status });
    }
  }
}) satisfies ActionFunction;

export const loader = (async () => {
  return redirect("/signup");
}) satisfies LoaderFunction;
