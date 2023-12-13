import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { CodeWithCopy } from "~/components/code-with-copy";

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
    <main className="container grid max-w-full content-start justify-items-center gap-10 pt-10 sm:pt-16 lg:max-w-3xl">
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
  );
}
