import customFontStyles from "~/styles/fonts.css";
import globalStyles from "~/styles/styles.css";
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { getTheme } from "./lib/theme.server";
import { useTheme } from "./lib/theme";
import { ClientHintsCheck, getClientHints } from "./lib/client-hints";
import { Toaster } from "sonner";
import { useLayoutInfo } from "./lib/layout-info";
import { cn } from "./lib/misc";
import { getCookieConsent } from "./lib/cookie-consent";
import { RootLayout } from "./components/root-layout";
import { getIsMobile } from "./lib/mobile";

export const links: LinksFunction = () => [
  { rel: "preload", href: customFontStyles, as: "style" },
  { rel: "preload", href: globalStyles, as: "style" },
  { rel: "stylesheet", href: customFontStyles },
  { rel: "stylesheet", href: globalStyles },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/icons/favicon-180x180.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/icons/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/icons/favicon-16x16.png",
  },
  {
    rel: "icon",
    type: "image/x-icon",
    href: "/icons/favicon.ico",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieConsent = getCookieConsent(request);
  return json({
    userPrefs: {
      theme: await getTheme(request),
    },
    clientHints: getClientHints(request),
    showCookieNotice: cookieConsent === null,
    isMobile: getIsMobile(request),
  });
};

export default function App() {
  const theme = useTheme();
  const { backgroundClassName } = useLayoutInfo();

  return (
    <html lang="en" className={`${theme}`}>
      <head>
        <ClientHintsCheck />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={cn(backgroundClassName)}>
        <RootLayout>
          <Outlet />
        </RootLayout>
        <Toaster closeButton theme={theme} duration={1500} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
