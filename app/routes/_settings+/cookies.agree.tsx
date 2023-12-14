import { json } from "@remix-run/node";
import { acknoledgeCookieNotice } from "~/lib/cookie-consent";

export const action = async () => {
  return json(null, {
    headers: {
      "Set-Cookie": acknoledgeCookieNotice(),
    },
  });
};
