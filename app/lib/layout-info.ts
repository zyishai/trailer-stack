import { useMatches } from "@remix-run/react";

export interface LayoutInfo {
  backgroundClassName: string;
}
// export interface LayoutInfoHandler<T = unknown> {
//   (prevInfo: LayoutInfo): LayoutInfo & T;
// }

const defaultLayoutInfo: Readonly<LayoutInfo> = {
  backgroundClassName: "bg-background",
};

// export function isLayoutInfoHandler<T>(fn: unknown): fn is LayoutInfoHandler<T> {
//   if (!(typeof fn === "function")) {
//     return false;
//   }
//   const result = fn();
//   if (
//     Object.keys(result).some(key =>
//       Object.keys(defaultLayoutInfo).includes(key),
//     )
//   ) {
//     return true;
//   }

//   return false;
// }

export function useLayoutInfo<T>(): LayoutInfo & T {
  const matches = useMatches();
  let layoutInfo = matches.reduce(
    (info, match) => {
      if (typeof match.handle === "function") {
        const matchInfo = match.handle(info);

        return { ...info, ...matchInfo }; // override
      }
      return info;
    },
    defaultLayoutInfo as LayoutInfo & T,
  );
  return layoutInfo;
}
