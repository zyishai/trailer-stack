import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirectBack } from "remix-utils/redirect-back";
import { Strategies, authenticator } from "~/lib/auth/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    await authenticator.authenticate(Strategies.AUTHN, request, {
      successRedirect: "/",
      throwOnError: true,
    });
  } catch (error: any) {
    if (error instanceof Response) {
      throw error;
    } else {
      console.error("Authn error:", error);
      throw redirectBack(request, { fallback: "/signin" });
    }
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  return redirectBack(request, { fallback: "/signin" });
}
