import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/lib/auth/auth.server";
import { redirectBack } from "remix-utils/redirect-back";

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.logout(request, {
    redirectTo: "/signin",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  throw redirectBack(request, { fallback: "/signin" });
}
