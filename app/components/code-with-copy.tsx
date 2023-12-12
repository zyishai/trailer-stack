import React, { useRef } from "react";
import { Copy } from "lucide-react";
import copy from "copy-to-clipboard";
import { useToast } from "./ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "~/lib/misc";

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
  const { toast } = useToast();

  const copyCode = () => {
    const codeText = (
      codeRef.current?.textContent || "Failed to copy code."
    ).replace(/^\$ (.*)/, "$1");
    if (copy(codeText, { format: "text/plain" })) {
      toast({ description: "✅ Code copied to clipboard" });
    }
  };
  return (
    <div className="flex max-w-full flex-col items-end gap-1.5 overflow-x-auto">
      <code ref={codeRef} className={cn(className)} data-print={print}>
        {children}
      </code>
      {allowCopy ? (
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
      ) : null}
    </div>
  );
};

export { CodeWithCopy };
