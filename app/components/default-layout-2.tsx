import { Link } from "@remix-run/react";

export const DefaultLayout2 = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <img src="/assets/logo.svg" alt="Trailer Logo" className="h-9" />
          </Link>
          <nav role="navigation">
            <ul className="flex items-center gap-4">
              <li>
                <Link to="/contact" className="muted hover:text-black">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/about" className="muted hover:text-black">
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="grid gap-4 px-8 py-4">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="grid gap-1">
            <img src="/assets/logo.svg" alt="Trailer logo" className="h-7" />
            <span className="muted">Quick and lightweight Remix stack.</span>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h6 className="small font-normal">Knowledge base</h6>
              <ul className="mt-2 grid gap-1">
                <li>
                  <Link to="/" className="text-sm font-light">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-sm font-light">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-sm font-light">
                    API docs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="small font-normal">Help</h6>
              <ul className="mt-2 grid gap-1">
                <li>
                  <Link to="/" className="text-sm font-light">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="small font-normal">Legal</h6>
              <ul className="mt-2 grid gap-1">
                <li>
                  <Link to="/" className="text-sm font-light">
                    Terms of service
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-sm font-light">
                    Privacy policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="muted mt-6 md:mt-0">
          &copy; {new Date().getFullYear()} Trailer Stack. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
