import { useFetcher } from "@remix-run/react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { capitalize } from "~/lib/misc";
import { THEMES, useTheme } from "~/lib/theme";

const themeIcons = {
  light: () => <SunIcon />,
  dark: () => <MoonIcon />,
};

const ThemeSelector = () => {
  const theme = useTheme();
  const fetcher = useFetcher();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          {themeIcons[theme]?.()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {[...THEMES, "system"].map(theme => (
          <fetcher.Form method="POST" action="/change-theme" key={theme}>
            <input type="hidden" name="theme" value={theme} />
            <button type="submit" className="w-full">
              <DropdownMenuItem>{capitalize(theme)}</DropdownMenuItem>
            </button>
          </fetcher.Form>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSelector };
