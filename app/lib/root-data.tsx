import { useRouteLoaderData } from "@remix-run/react";
import { loader } from "~/root";
import { DEFAULT_THEME } from "./theme";

export function useRootData() {
  const rootLoaderData = useRouteLoaderData<typeof loader>("root");

  return rootLoaderData;
}

export function useUserPrefs() {
  const rootData = useRootData();
  if (!rootData) {
    return {
      theme: DEFAULT_THEME,
    };
  }

  return rootData.userPrefs;
}

export function useShowCookieNotice() {
  const rootData = useRootData();

  return rootData?.showCookieNotice ?? true;
}

export function useIsMobile() {
  const rootData = useRootData();

  return rootData?.isMobile ?? false;
}

export function useUser() {
  const rootData = useRootData();

  return rootData?.user || null;
}
