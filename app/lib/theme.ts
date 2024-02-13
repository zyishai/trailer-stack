import { useRouteLoaderData } from "@remix-run/react";
import { type loader as rootLoader } from "~/root";
import { getClientHints } from "./client-hints";

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "light";

export function useTheme() {
  const loaderInfo = useRouteLoaderData<typeof rootLoader>("root");
  if (!loaderInfo) {
    return getClientHints().theme;
  }

  return loaderInfo.userPrefs.theme || loaderInfo.clientHints.theme;
}

export function isTheme(value: string): value is Theme {
  return THEMES.includes(value as any);
}

export function assertTheme(value: string): asserts value is Theme {
  if (!THEMES.includes(value as any)) {
    throw new Error(
      `${value} theme is not supported. Supported themes are: ${THEMES.join(
        ", ",
      )}`,
    );
  }
}
