import { FormStrategy } from "remix-auth-form";
import { type FormStrategyCredentials } from "./schema";
import { signin, signup } from "./mutations";

export default new FormStrategy(async ({ form, context }) => {
  if (!context?.credentials) {
    console.error(
      `🚨 [Form Auth] Server error: context.credentials doesn't exist`,
    );
    throw new Error("Server error: failed to retrieve credentials");
  }
  // This should be correct, because we parse the form data in the handlers
  const credentials = context.credentials as FormStrategyCredentials;

  if (credentials.intent === "login") {
    const { username, password } = credentials;

    try {
      const user = await signin(username, password);
      if (!user) {
        throw new Error("Invalid username or password");
      }

      return user;
    } catch (error: any) {
      console.error(`🚨 [Signin] Server error: ${error}`);
      throw new Error("Server error: failed to signin user");
    }
  } else {
    // Create user
    const { username, password, email } = credentials;

    try {
      const user = await signup(username, password, email);
      if (!user) {
        throw new Error("Invalid username or password");
      }

      return user;
    } catch (error: any) {
      console.error(`🚨 [Signup] Server error: ${error}`);
      throw new Error("Server error: failed to create user");
    }
  }
});
