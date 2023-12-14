import { Link } from "@remix-run/react";
import {
  FacebookIcon,
  GithubIcon,
  TwitterIcon,
  YoutubeIcon,
} from "lucide-react";
import { ThemeSelector } from "./theme-selector";
import { CookiesNotice } from "./cookies-notice";
import { useCookieConsent } from "~/lib/cookie-consent";

type LayoutProps = {
  showHeader?: boolean;
  showFooter?: boolean;
  logo?: {
    href: string;
    alt?: string;
  };
};
export const DefaultLayout = ({
  showHeader = true,
  showFooter = true,
  logo = { href: "/assets/logo.svg", alt: "Trailer Logo" },
  children,
}: React.PropsWithChildren<LayoutProps>) => {
  const cookieConsent = useCookieConsent();

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

      {cookieConsent.showCookieNotice ? (
        <CookiesNotice className="fixed bottom-14 right-6 max-w-3xl self-end" />
      ) : null}

      {showFooter ? (
        <footer className="px-8 py-6 sm:py-4">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <p className="muted">
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
};
