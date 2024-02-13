import { parse, serialize } from "cookie";

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
