import type { LoaderFunctionArgs } from "@remix-run/node";
import { generateSitemap } from "@nasa-gcn/remix-seo";
import { routes } from "@remix-run/dev/server-build";
import { getDomain } from "~/lib/misc";

export function loader({ request }: LoaderFunctionArgs) {
  return generateSitemap(request, routes, {
    siteUrl: getDomain(request),
    headers: {
      "Cache-Control": "max-age=300", // 5 mins
    },
  });
}
