import { z } from "zod";

export const Submission = z.object({
  intent: z.string(),
  payload: z.record(z.any()),
  error: z.record(z.string().array()),
  value: z.any().optional(),
});
