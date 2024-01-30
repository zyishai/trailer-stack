import type { MetaFunction } from "@remix-run/node";
import { Link, useRouteLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { CodeWithCopy } from "~/components/code-with-copy";
import { MouseIcon } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { LogoutButton } from "~/components/logout-button";
import { loader } from "~/root";

export const meta: MetaFunction = () => {
  return [
    { title: "Trailer Stack" },
    {
      name: "description",
      content: "The Trailer Stack is a fast and lightweight Remix stack.",
    },
  ];
};

export const handle = { layoutInfo: { logo: null /* hide logo */ } };

export default function IndexPage() {
  const rootLoaderData = useRouteLoaderData<typeof loader>("root");
  return (
    <main className="h-full snap-y snap-mandatory overflow-auto">
      <section className="relative -mt-20 mb-20 grid h-full snap-center place-content-center justify-items-center gap-4 px-4">
        <img src="/assets/logo-wide.svg" alt="Trailer Stack" className="h-28" />
        <div className="flex gap-3 text-xl font-semibold">
          <span className="text-gray-500 dark:text-gray-500">Create</span>
          <span className="">.</span>
          <span className="text-gray-600 dark:text-gray-400">Build</span>
          <span className="">.</span>
          <span className="text-gray-800 dark:text-gray-300">Deploy</span>
        </div>
        {rootLoaderData?.user ? <LogoutButton /> : null}
        <Separator className="my-2 w-1/4 bg-slate-200" />
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="default"
            className="bg-sky-700 hover:bg-sky-700/90"
            asChild
          >
            <Link to="/signin" className="muted">
              Try it out!
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/zyishai/trailer-stack"
              target="_blank"
              rel="noreferrer"
              className="muted"
            >
              Source Code
            </a>
          </Button>
        </div>
        <div className="absolute inset-x-0 -bottom-20 flex animate-bounce flex-col items-center gap-1 text-slate-400">
          <MouseIcon />
          <span className="small">Scroll down</span>
        </div>
      </section>

      <section className="grid h-full snap-center place-content-center justify-items-center gap-12 px-4">
        <h1>Quick Start</h1>
        <div className="grid gap-4 text-center">
          <span className="lead">
            Run the following command in your terminal:
          </span>
          <CodeWithCopy>
            $ npx create-remix@latest --template zyishai/trailer-stack
          </CodeWithCopy>
        </div>
        <Button variant="outline" asChild>
          <Link to="https://github.com/zyishai/trailer-stack/" target="_blank">
            Learn More
          </Link>
        </Button>
      </section>

      <div className="relative -z-10 opacity-20">
        <div
          className="fixed -left-12 bottom-0 -z-10 h-80 w-64 scale-75 md:scale-100"
          style={{
            backgroundImage: "url(/assets/puzzle-1.svg)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center bottom",
          }}
        ></div>
        <div
          className="fixed right-20 top-0 -z-10 hidden h-80 w-64 md:block"
          style={{
            backgroundImage: "url(/assets/puzzle-2.svg)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center bottom",
          }}
        ></div>
        <div
          className="fixed bottom-28 right-8 -z-10 hidden h-80 w-64 scale-75 sm:block md:right-56 md:scale-100"
          style={{
            backgroundImage: "url(/assets/puzzle-4.svg)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center bottom",
          }}
        ></div>
        <div
          className="fixed -left-8 -top-4 -z-10 h-80 w-64 scale-75"
          style={{
            backgroundImage: "url(/assets/puzzle-3.svg)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center bottom",
          }}
        ></div>
        <div
          className="fixed -top-36 left-80 -z-10 h-80 w-64 scale-[.45]"
          style={{
            backgroundImage: "url(/assets/puzzle-5.svg)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center bottom",
          }}
        ></div>
      </div>
    </main>
  );
}
