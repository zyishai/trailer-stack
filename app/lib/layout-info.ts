import { useMatches } from "@remix-run/react";

export function useLayoutInfo(): Record<string, any> {
  const matches = useMatches();
  let layoutInfo = matches.reduce((info, match) => {
    let matchInfo;

    if (typeof match.handle === "function") {
      matchInfo = match.handle(info);
    } else {
      matchInfo = match.handle;
    }

    if (
      typeof matchInfo === "object" &&
      matchInfo !== null &&
      "layoutInfo" in matchInfo
    ) {
      return { ...info, ...matchInfo.layoutInfo }; // override
    } else {
      return info;
    }
  }, {});

  return layoutInfo;
}
