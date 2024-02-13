/*
 * NOTE: This is heavly influenced by the `epic-stack` Remix stack.
 * https://github.com/epicweb-dev/epic-stack/blob/1248d8465ee0fa1b6c13485b0ee5160045c1ef9c/app/root.tsx
 */

import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { parse } from "cookie";
import { DEFAULT_THEME, isTheme } from "./theme";

const clientHints = {
  theme: {
    cookieName: "CH-prefers-color-scheme",
    getValueString: `window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'`,
    fallback: DEFAULT_THEME,
    transform: (value: string) => {
      if (isTheme(value)) {
        return value;
      }

      return DEFAULT_THEME;
    },
  },
};

type ClientHintKeys = keyof typeof clientHints;

export function ClientHintsCheck() {
  const { revalidate } = useRevalidator();

  useEffect(() => {
    const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    function handleThemeChange() {
      document.cookie = `${clientHints.theme.cookieName}=${
        themeQuery.matches ? "dark" : "light"
      }`;
      revalidate();
    }

    themeQuery.addEventListener("change", handleThemeChange);

    return () => themeQuery.removeEventListener("change", handleThemeChange);
  }, [revalidate]);

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
      const cookies = document.cookie.split(';').map(cookie => cookie.trim()).reduce((acc, cookie) => {
        const [key, value] = cookie.split('=');
        acc[key] = value;
        return acc;
      }, {});
      let cookieChanged = false;
      const hints = [
        ${Object.values(clientHints)
          .map(
            hint =>
              `{ name: '${hint.cookieName}', cookieValue: cookies['${hint.cookieName}'], clientValue: String(${hint.getValueString}) }`,
          )
          .join(",\n")}
      ];
      for (const hint of hints) {
        if (decodeURIComponent(hint.cookieValue) !== hint.clientValue) {
          cookieChanged = true;
          document.cookie = encodeURIComponent(hint.name) + '=' + encodeURIComponent(hint.clientValue) + ';path=/';
        }
      }
      if (cookieChanged && navigator.cookieEnabled) {
        window.location.reload();
      }`,
      }}
    />
  );
}

export const getClientHints = (request?: Request) => {
  const cookieString =
    typeof document !== "undefined"
      ? document.cookie
      : request?.headers.get("cookie") ?? "";
  const cookies = parse(cookieString);

  return Object.entries(clientHints).reduce(
    (acc, [name, hint]) => {
      if (typeof hint.transform === "function") {
        acc[name as ClientHintKeys] = hint.transform(
          cookies[hint.cookieName] || hint.fallback,
        );
      } else {
        // @ts-expect-error
        acc[name as ClientHintKeys] = cookies[hint.cookieName] || hint.fallback;
      }
      return acc;
    },
    {} as {
      [K in ClientHintKeys]: (typeof clientHints)[K] extends {
        transform: (value: any) => infer R;
      }
        ? R
        : (typeof clientHints)[K]["fallback"];
    },
  );
};
