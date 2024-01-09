import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDomain(request: Request, pathname?: string) {
  const host =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("host") ||
    new URL(request.url).host;
  const protocol =
    new URL(request.url).protocol.replace(/:/g, "") ||
    (host.includes("localhost") ? "http" : "https");
  return new URL(pathname ?? "", `${protocol}://${host}`).href;
}

export function devOnlyEnabled() {
  if (process.env.NODE_ENV !== "development") {
    throw new Response(undefined, {
      status: 404,
      statusText: "Not Found",
    });
  }
}

export function isFormData(data: unknown): data is FormData {
  return data instanceof FormData;
}
