import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirectBack } from "remix-utils/redirect-back";
import { AuthToken } from "~/lib/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const token = await AuthToken.get(request);
  return await token.downgrade({ redirectTo: "/signin" });
}

export async function loader({ request }: LoaderFunctionArgs) {
  throw redirectBack(request, { fallback: "/signin" });
}
