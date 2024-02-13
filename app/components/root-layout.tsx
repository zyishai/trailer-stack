import { Link } from "@remix-run/react";
import {
  FacebookIcon,
  GithubIcon,
  TwitterIcon,
  YoutubeIcon,
} from "lucide-react";
import { ThemeSelector } from "~/components/theme-selector";
import { CookiesNotice } from "~/components/cookies-notice";
import { useLayoutInfo } from "~/lib/layout-info";
import { useShowCookieNotice } from "~/lib/root-data";

type LayoutProps = {
  showHeader?: boolean;
  showFooter?: boolean;
  logo?: {
    href: string;
    alt?: string;
  };
};
export function RootLayout({ children }: React.PropsWithChildren) {
  const layoutInfo = useLayoutInfo();
  const layoutProps: LayoutProps = {
    showHeader: true,
    showFooter: true,
    logo: { href: "/assets/logo.svg", alt: "Trailer Logo" },
    ...layoutInfo,
  };
  const { showHeader, showFooter, logo } = layoutProps;
  const showCookieNotice = useShowCookieNotice();

  return (
    <div className="flex h-screen flex-col">
      {showHeader ? (
        <header className="px-8 py-4">
          <div className="flex items-center justify-between">
            {logo ? (
              <Link to="/">
                <img src={logo.href} alt={logo.alt} className="h-9" />
              </Link>
            ) : (
              <div></div>
            )}
            <ThemeSelector />
          </div>
        </header>
      ) : null}

      <div className="flex-1 overflow-hidden">{children}</div>

      {showCookieNotice ? (
        <CookiesNotice className="fixed bottom-0 max-w-full self-end sm:bottom-14 md:right-6 md:max-w-2xl" />
      ) : null}

      {showFooter ? (
        <footer className="px-8 py-6 sm:py-4">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <p className="muted font-light">
              &copy; {new Date().getFullYear()} Trailer Stack
            </p>

            <div className="sm:grid-1 mt-4 flex space-x-6 justify-self-center sm:mt-0 sm:justify-self-end">
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="muted hover:text-foreground"
              >
                <span className="sr-only">Github</span>
                <GithubIcon
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  strokeWidth={1}
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="muted hover:text-foreground"
              >
                <span className="sr-only">X (Twitter)</span>
                <TwitterIcon
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  strokeWidth={1}
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="muted hover:text-foreground"
              >
                <span className="sr-only">Facebook</span>
                <FacebookIcon
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  strokeWidth={1}
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="muted hover:text-foreground"
              >
                <span className="sr-only">Youtube</span>
                <YoutubeIcon
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  strokeWidth={1}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
