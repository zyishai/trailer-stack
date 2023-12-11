import customFontStyles from "~/styles/fonts.css";
import globalStyles from "~/styles/styles.css";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";

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

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <TooltipProvider>
          <Outlet />
        </TooltipProvider>
        <Toaster />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
