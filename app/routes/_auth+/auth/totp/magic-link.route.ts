import { LoaderFunctionArgs } from "@remix-run/node";
import { Strategies, authenticator } from "~/lib/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.authenticate(Strategies.TOTP, request, {
    successRedirect: "/",
    failureRedirect: "/signin?method=totp",
  });
}
