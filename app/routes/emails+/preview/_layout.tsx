import { NavLink, Outlet, useNavigate } from "@remix-run/react";
import capitalize from "capitalize";
import { cn } from "~/lib/misc";
import { FileIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useMobile } from "~/lib/mobile";
import { useEventSource } from "remix-utils/sse/react";

export default function PreviewEmails() {
  const { isMobile } = useMobile();
  const navigate = useNavigate();
  const rawEvent = useEventSource("/emails/sse/templates");
  const templateNames = getTemplateNames(rawEvent);

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden px-8 py-4 md:flex-row">
      <aside className="flex overflow-hidden md:w-44">
        <ul
          className={cn(
            "scrollbar-hide max-h-44 flex-1 overflow-auto md:max-h-full",
            isMobile ? "hidden" : "",
          )}
        >
          {templateNames.map(template => (
            <li key={template} className="flex">
              <NavLink
                to={template}
                className={({ isActive }) =>
                  cn(
                    "flex flex-1 gap-1 overflow-hidden border-l-4 px-2 py-2",
                    isActive
                      ? "border-slate-700 bg-slate-100 dark:border-slate-600 dark:bg-slate-900"
                      : "border-transparent",
                  )
                }
              >
                <FileIcon className="h-5" />
                <span
                  className="truncate text-sm"
                  title={capitalize.words(template)}
                >
                  {capitalize.words(template)}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
        {isMobile ? (
          <Select onValueChange={value => navigate(value)}>
            <SelectTrigger className="bg-white dark:bg-background">
              <SelectValue placeholder="Pick a template to preview" />
            </SelectTrigger>
            <SelectContent>
              {templateNames.map(template => (
                <SelectItem key={template} value={capitalize.words(template)}>
                  {capitalize.words(template)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </aside>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function getTemplateNames(event?: string | null): string[] {
  if (!event) {
    return [];
  }

  const parsed = JSON.parse(event);
  return parsed.templates;
}
