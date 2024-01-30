import { z } from "zod";

export const SubmissionSchema = z.object({
  intent: z.string(),
  payload: z.record(z.any()),
  error: z.record(z.string().array()),
  value: z.any().optional(),
});
