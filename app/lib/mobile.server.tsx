import mobile from "is-mobile";

export function getIsMobile(request?: Request) {
  type UserAgentData = {
    brands?: { brand: string; version: string }[];
    mobile?: boolean;
    platform?: string;
  };
  // Both Deno environment and the browser have the Navigator object, but only some browsers support the `userAgentData`
  // property (Deno supports only the `userAgent` string property).
  const userAgentData =
    typeof navigator !== "undefined" && "userAgentData" in navigator
      ? (navigator.userAgentData as UserAgentData)
      : null;
  const userAgent =
    typeof navigator !== "undefined"
      ? navigator.userAgent
      : request?.headers.get("user-agent") ?? "";

  return userAgentData?.mobile ?? mobile({ ua: userAgent });
}
