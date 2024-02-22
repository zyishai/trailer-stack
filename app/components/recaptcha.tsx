import { ClientOnly } from "remix-utils/client-only";
import { ExternalScriptsHandle } from "remix-utils/external-scripts";
import { cn } from "~/lib/misc";
import { useTheme } from "~/lib/theme";

export const scriptHandle: ExternalScriptsHandle = {
  scripts: [
    {
      src: "https://www.google.com/recaptcha/api.js",
      async: true,
      defer: true,
    },
  ],
};

export function ReCaptcha({
  clientKey,
  className,
}: {
  clientKey: string;
  className?: string;
}) {
  const theme = useTheme();

  return (
    <ClientOnly>
      {() => (
        <div
          className={cn("g-recaptcha", className)}
          data-sitekey={clientKey}
          data-theme={theme}
        ></div>
      )}
    </ClientOnly>
  );
}

type ReCaptchaError =
  | "missing-input-secret"
  | "invalid-input-secret"
  | "missing-input-response"
  | "invalid-input-response"
  | "bad-request"
  | "timeout-or-duplicate";
export type ReCaptchaResponse = {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  "error-codes": ReCaptchaError[];
};
