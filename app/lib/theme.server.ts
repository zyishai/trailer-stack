import { createCookie } from "@remix-run/node";
import { type Theme, isTheme } from "./theme";

const cookieName = "en_theme";

const themeStorage = createCookie(cookieName, {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  maxAge: 604_800,
});

export async function getTheme(request: Request) {
  const theme = await themeStorage.parse(request.headers.get("cookie"));
  if (isTheme(theme)) {
    return theme as Theme;
  }
  return null;
}

export async function setTheme(theme: Theme | "system") {
  if (theme === "system") {
    return await themeStorage.serialize("", { maxAge: -1 });
  } else {
    return await themeStorage.serialize(theme);
  }
}
