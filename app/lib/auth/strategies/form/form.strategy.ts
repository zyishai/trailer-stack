import { FormStrategy } from "remix-auth-form";
import { formLoginSchema, formRegisterSchema } from "./schema";
import { parse } from "@conform-to/zod";
import { createNewUser, verifyUser } from "~/models/user";

function isFormData(data: unknown): data is FormData {
  return data instanceof FormData;
}

const Intents = {
  login: "login",
  register: "register",
} as const;

export default new FormStrategy(async ({ form, context }) => {
  const formData =
    context?.form && isFormData(context.form) ? context.form : form;
  const submission = parse(formData, {
    schema: intent => {
      if (intent === Intents.login) return formLoginSchema;
      if (intent === Intents.register) return formRegisterSchema;
      throw new Error("Invalid intent value", {
        cause: {
          intent: `Invalid intent value. Expected "login" or "register" but got "${intent}"`,
        },
      });
    },
  });

  if (Object.keys(submission.error).length > 0) {
    throw new Error("Invalid credentials", {
      cause: submission.error,
    });
  }

  if (!submission.value) {
    throw new Error("Missing credentials"); // this shouldn't throw, but we need to satisfy TS as well :)
  }

  if (submission.intent === Intents.login) {
    const user = await verifyUser(submission.value);
    return user;
  } else {
    // @ts-expect-error
    const user = await createNewUser(submission.value);
    return user;
  }
});
