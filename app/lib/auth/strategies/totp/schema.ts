import normalizeEmail from "normalize-email";
import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().email().transform(normalizeEmail),
});
