import type { LoaderFunctionArgs } from "@remix-run/node";
import { generateRobotsTxt } from "@nasa-gcn/remix-seo";
import { getDomain } from "~/lib/misc";

export function loader({ request }: LoaderFunctionArgs) {
  return generateRobotsTxt(
    [{ type: "sitemap", value: `${getDomain(request)}/sitemap.xml` }],
    {
      headers: {
        "Cache-Control": "no-cache",
      },
    },
  );
}
