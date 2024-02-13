import { Link, useFetcher } from "@remix-run/react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CookieIcon } from "lucide-react";
import { cn } from "~/lib/misc";
import { Button } from "./ui/button";

type CookiesNoticeProps = {
  className?: string;
};

export function CookiesNotice({ className }: CookiesNoticeProps) {
  const fetcher = useFetcher();

  return (
    <Alert
      className={cn(
        "grid grid-cols-[auto,_1fr,_auto] gap-x-3 shadow-sm",
        className,
      )}
    >
      <span>
        <CookieIcon className="h-5 w-5" />
      </span>
      <div>
        <AlertTitle className="text-sm font-normal sm:text-base">
          Cookies Notice
        </AlertTitle>
        <AlertDescription>
          <p className="text-xs font-light sm:text-sm">
            We use cookies to provide necessary website functionality and
            analyze our traffic. By continuing to use our website, you agree to
            our use of cookies. For more information, please read our{" "}
            <Link to="/cookies" className="underline">
              Cookies Policy
            </Link>
            .
          </p>
        </AlertDescription>
      </div>
      <div className="self-center">
        <fetcher.Form method="post" action="/cookies/accept">
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="text-xs font-normal sm:text-sm"
          >
            I Understand
          </Button>
        </fetcher.Form>
      </div>
    </Alert>
  );
}
