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
    <Alert className={cn("shadow-sm", className)}>
      <CookieIcon className="h-5 w-5" />
      <AlertTitle className="text-sm sm:text-base">Cookies Notice</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col">
        <p className="text-xs sm:text-sm">
          We use cookies to provide necessary website functionality and analyze
          our traffic. By continuing to use our website, you agree to our use of
          cookies. For more information, please read our{" "}
          <Link to="/cookies-policy" className="underline">
            Cookies Policy
          </Link>
          .
        </p>
        <div className="mt-3 self-end">
          <fetcher.Form method="post" action="/cookies/agree">
            <Button type="submit" size="sm" className="text-xs sm:text-sm">
              I Understand
            </Button>
          </fetcher.Form>
        </div>
      </AlertDescription>
    </Alert>
  );
}
