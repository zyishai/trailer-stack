import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { CodeWithCopy } from "~/components/code-with-copy";
import {
  FacebookIcon,
  GithubIcon,
  TwitterIcon,
  YoutubeIcon,
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Trailer Stack" },
    {
      name: "description",
      content: "The Trailer Stack is a fast and lightweight Remix stack.",
    },
  ];
};

export default function IndexPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="container grid max-w-full flex-1 content-start justify-items-center gap-10 pt-10 sm:pt-16 lg:max-w-3xl">
        <img
          src="/assets/logo-wide.svg"
          alt="Trailer logo wide"
          width="590"
          height="144"
          className="w-auto md:h-48"
        />
        <div className="text-center">
          <h1 className="tracking-normal text-slate-900 dark:text-slate-200 sm:text-6xl">
            Trailer Stack
          </h1>
          <div className="lead bg-gradient-to-r from-slate-300 to-slate-700 bg-clip-text font-semibold text-transparent dark:from-slate-600 dark:to-slate-300">
            Create . Build . Deploy
          </div>
        </div>
        <CodeWithCopy>
          $ npx create-remix@latest --template zyishai/trailer-stack
        </CodeWithCopy>
        <Button variant="outline" asChild>
          <Link to="https://github.com/zyishai/trailer-stack/" target="_blank">
            Learn More
          </Link>
        </Button>
      </main>
      <footer className="mt-16 p-4 lg:px-8 lg:py-6">
        <div className="grid">
          <p className="grid-1 justify-self-center text-xs leading-5 text-muted-foreground sm:text-sm">
            &copy; {new Date().getFullYear()} Your Company Inc. All rights
            reserved.
          </p>
          <div className="sm:grid-1 mt-4 flex space-x-6 justify-self-center sm:mt-0 sm:justify-self-end">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-white"
            >
              <span className="sr-only">Github</span>
              <GithubIcon
                className="h-4 w-4 sm:h-5 sm:w-5"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-white"
            >
              <span className="sr-only">X (Twitter)</span>
              <TwitterIcon
                className="h-4 w-4 sm:h-5 sm:w-5"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-white"
            >
              <span className="sr-only">Facebook</span>
              <FacebookIcon
                className="h-4 w-4 sm:h-5 sm:w-5"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-white"
            >
              <span className="sr-only">Youtube</span>
              <YoutubeIcon
                className="h-4 w-4 sm:h-5 sm:w-5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
