import { FormStrategy } from "remix-auth-form";
import { User, UserResponse } from "~/models/user";
import { getDatabaseInstance } from "~/lib/db.server";
import { parse } from "@conform-to/zod";
import { loginSchema, registerSchema } from "./schema";
import { signin, signup } from "./mutations";
import { isFormData } from "~/lib/misc";
import { z } from "zod";
import { Submission } from "@conform-to/react";
import { validateEmailAddress } from "~/lib/email.server";

const intentSchema = z.enum(["login", "register"]).catch("register");

export default new FormStrategy(async ({ form, context }) => {
  const formData =
    context?.form && isFormData(context.form) ? context.form : form;

  const intent = intentSchema.parse(formData.get("intent")?.toString());
  const schema = intent === "login" ? loginSchema : registerSchema;
  const credentials = parse(formData, { schema });

  if (!credentials.value) {
    throw credentials;
  }

  const db = await getDatabaseInstance();

  if (intent === "login") {
    const loginResults = await db.query<UserResponse>(
      signin,
      credentials.value,
    );
    // Converting the raw object to URLSearchParams because `parse` gets either `FormData` or `URLSearchParams`.
    const userResponse = new URLSearchParams(loginResults[0] ?? undefined);
    const user = parse(userResponse, { schema: User });

    if (!user.value) {
      throw user;
    } else {
      return user.value;
    }
  } else {
    // Verify email address is trusted and not disposable
    if (
      "email" in credentials.value &&
      typeof credentials.value.email === "string"
    ) {
      if (!(await validateEmailAddress(credentials.value.email))) {
        throw {
          intent,
          payload: credentials,
          error: {
            email: ["Invalid email address"],
          },
        } as Submission;
      }
    }

    // Create user
    const registerResults = await db.query<UserResponse>(
      signup,
      credentials.value,
    );
    const userResponse = new URLSearchParams(registerResults[0] ?? undefined);
    const user = parse(userResponse, { schema: User });

    if (!user.value) {
      throw user;
    } else {
      return user.value;
    }
  }
});
