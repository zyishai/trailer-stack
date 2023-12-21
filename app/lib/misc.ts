import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDomain(request: Request) {
  const host =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("host") ||
    new URL(request.url).host;
  const protocol =
    new URL(request.url).protocol ||
    (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
