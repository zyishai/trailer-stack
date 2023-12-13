import { useMatches } from "@remix-run/react";
import { DefaultLayout } from "~/components/default-layout";

export interface LayoutInfo<P = Object> {
  layout: React.FC<React.PropsWithChildren<P>>;
  layoutProps: P;
  backgroundClassName: string;
}
export interface LayoutInfoHandler {
  (prevInfo: LayoutInfo): LayoutInfo;
}

const defaultLayoutInfo: Readonly<LayoutInfo> = {
  layout: DefaultLayout,
  layoutProps: {},
  backgroundClassName: "bg-background",
};

export function isLayoutInfoHandler(fn: unknown): fn is LayoutInfoHandler {
  if (!(typeof fn === "function")) {
    return false;
  }
  const result = fn();
  if (
    Object.keys(result).some(key =>
      Object.keys(defaultLayoutInfo).includes(key),
    )
  ) {
    return true;
  }

  return false;
}

export function useLayoutInfo(): LayoutInfo {
  const matches = useMatches();
  let layoutInfo = matches.reduce((info, match) => {
    if (isLayoutInfoHandler(match.handle)) {
      const matchInfo = match.handle(info);

      return { ...info, ...matchInfo }; // override
    }
    return info;
  }, defaultLayoutInfo);
  return layoutInfo;
}
