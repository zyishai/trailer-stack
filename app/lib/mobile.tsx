import { useRouteLoaderData } from "@remix-run/react";
import { loader } from "~/root";

export function useMobile() {
  const loaderInfo = useRouteLoaderData<typeof loader>("root");
  if (!loaderInfo) {
    throw new Error("Root loader has not been loaded");
  }

  return {
    isMobile: loaderInfo.isMobile,
  };
}
