import { Link } from "@remix-run/react";
import {
  FacebookIcon,
  GithubIcon,
  TwitterIcon,
  YoutubeIcon,
} from "lucide-react";
import { ThemeSelector } from "./theme-selector";

type LayoutProps = {
  showHeader?: boolean;
  showFooter?: boolean;
};
export const DefaultLayout = ({
  showHeader = true,
  showFooter = true,
  children,
}: React.PropsWithChildren<LayoutProps>) => {
  return (
    <div className="flex h-screen flex-col">
      {showHeader ? (
        <header className="px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <img src="/assets/logo.svg" alt="Trailer Logo" className="h-9" />
            </Link>
            <ThemeSelector />
            {/* <nav role="navigation">
            <ul className="flex items-center gap-4">
              <li>
                <Link to='/contact' className="muted hover:text-black">Contact</Link>
              </li>
              <li>
                <Link to='/about' className="muted hover:text-black">About</Link>
              </li>
            </ul>
          </nav> */}
          </div>
        </header>
      ) : null}

      <div className="flex-1 overflow-hidden">{children}</div>

      {showFooter ? (
        <footer className="px-8 py-4">
          <div className="flex items-center justify-between">
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
                  className="h-3 w-3 sm:h-5 sm:w-5"
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
                  className="h-3 w-3 sm:h-5 sm:w-5"
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
                  className="h-3 w-3 sm:h-5 sm:w-5"
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
                  className="h-3 w-3 sm:h-5 sm:w-5"
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
