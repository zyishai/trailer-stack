import React, { useRef } from "react";
import { ClipboardCheckIcon, Copy } from "lucide-react";
import copy from "copy-to-clipboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "~/lib/misc";
import { toast } from "sonner";

interface CodeProps {
  className?: string;
  allowCopy?: boolean;
  print?: boolean;
}

const CodeWithCopy = ({
  className,
  allowCopy = true,
  print = false,
  children,
}: React.PropsWithChildren<CodeProps>) => {
  const codeRef = useRef<HTMLElement | null>(null);

  const copyCode = () => {
    const codeText = (
      codeRef.current?.textContent || "Failed to copy code."
    ).replace(/^\$ (.*)/, "$1");
    if (copy(codeText, { format: "text/plain" })) {
      toast("Code copied to clipboard", {
        icon: <ClipboardCheckIcon size={14} />,
        position: "bottom-center",
      });
    }
  };
  return (
    <div className="flex max-w-full flex-col items-end gap-1.5 overflow-x-auto">
      <code ref={codeRef} className={cn(className)} data-print={print}>
        {children}
      </code>
      {allowCopy ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex items-center text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                onClick={copyCode}
              >
                <Copy className="h-3" />
                <span className="text-xs">copy</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">Copy code</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
};

export { CodeWithCopy };
