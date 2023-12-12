import { type ActionFunctionArgs, json } from "@remix-run/node";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import { setTheme } from "~/lib/theme.server";
import { THEMES } from "~/lib/theme";

const ChangeThemeSchema = z.object({
  theme: z.enum(["system", ...THEMES]),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parse(formData, { schema: ChangeThemeSchema });

  if (submission.intent !== "submit") {
    return json({ status: "idle", submission });
  }
  if (!submission.value) {
    return json({ status: "error", submission });
  }

  return json(
    { status: "success", submission },
    { headers: { "Set-Cookie": await setTheme(submission.value.theme) } },
  );
};
