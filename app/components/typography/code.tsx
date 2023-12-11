import React, { useRef } from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { Copy } from "lucide-react";
import copy from "copy-to-clipboard";
import { useToast } from "../ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const codeVariants = cva("rounded-lg bg-black px-3 py-2 sm:px-5 sm:py-2", {
  variants: {
    fullWidth: {
      true: "[& code]:whitespace-nowrap w-full overflow-hidden [&>pre]:overflow-x-auto",
      false: "w-min",
    },
  },
  defaultVariants: {
    fullWidth: false,
  },
});

interface CodeProps extends VariantProps<typeof codeVariants> {
  className?: string;
  allowCopy?: boolean;
}

const Code = ({
  fullWidth,
  className,
  allowCopy = true,
  children,
}: React.PropsWithChildren<CodeProps>) => {
  const codeRef = useRef<HTMLElement | null>(null);
  const { toast } = useToast();

  const copyCode = () => {
    const codeText = (
      codeRef.current?.textContent || "Failed to copy code."
    ).replace(/^\$ (.*)/, "$1");
    if (copy(codeText, { format: "text/plain" })) {
      toast({ title: "Code copied to clipboard" });
    }
  };
  return (
    <div className={codeVariants({ fullWidth, className })}>
      <pre className="flex justify-between py-1 sm:py-3">
        <code
          className="text-xs leading-5 text-white sm:text-base"
          ref={codeRef}
        >
          {children}
        </code>
        {allowCopy ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-50"
                onClick={copyCode}
              >
                <Copy size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">Copy code</span>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </pre>
    </div>
  );
};

export { Code };
