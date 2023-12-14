import { useRouteLoaderData } from "@remix-run/react";
import { parse, serialize } from "cookie";
import { loader } from "~/root";

const cookieName = "CN-viewed-ack";

export function getCookieConsent(request: Request) {
  const cookies = parse(request.headers.get("cookie") || "");
  if (cookies[cookieName] === "true") {
    return true;
  }

  return null;
}

export function acknoledgeCookieNotice() {
  return serialize(cookieName, "true", { path: "/" });
}

export function useCookieConsent() {
  const loaderData = useRouteLoaderData<typeof loader>("root");
  const showCookieNotice = loaderData?.showCookieNotice ?? true;
  return { showCookieNotice };
}
