import { Resizable } from "re-resizable";
import { cn } from "~/lib/misc";
import { useMobile } from "~/lib/mobile";

type PreviewerProps = {
  html: string;
  className?: string;
};
export function Previewer({ html, className }: PreviewerProps) {
  const { isMobile } = useMobile();

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-1 justify-center bg-slate-200 dark:bg-slate-800">
        {isMobile ? (
          <iframe
            srcDoc={html}
            className="flex-1 bg-white dark:bg-slate-100"
            title="mobile-previewer"
          ></iframe>
        ) : (
          <Resizable
            className="max-w-full border border-slate-400 bg-white dark:bg-slate-100"
            enable={{
              top: false,
              bottom: false,
              topRight: false,
              topLeft: false,
              bottomRight: false,
              bottomLeft: false,
              right: true,
              left: true,
            }}
            resizeRatio={2}
            defaultSize={{ width: "100%", height: "100%" }}
            maxWidth="100%"
            minWidth="375px"
          >
            <iframe
              srcDoc={html}
              className="h-full w-full"
              title="desktop-previewer"
            ></iframe>
          </Resizable>
        )}
      </div>
      <p className="text-center text-xs text-slate-600 dark:text-slate-400">
        {isMobile
          ? "👉 Tip: view this page on desktop to get responsive preview."
          : "👉 This viewer is responsive! Drag the right or left border to resize the viewer."}
      </p>
    </div>
  );
}
