import type { Submission } from "@conform-to/react";
import { z } from "zod";

const submissionSchema = z.object({
  intent: z.string(),
  payload: z.record(z.any()),
  error: z.record(z.string().array()),
  value: z.any().optional(),
});

const getSubmission = (error: Error, formData: FormData): Submission => {
  let originalError;
  try {
    originalError = JSON.parse((error.cause as any)?.message ?? "{}");
  } catch {
    originalError = error;
  }

  const submission = submissionSchema.safeParse(originalError);

  if (submission.success) {
    return submission.data;
  } else {
    const errorMessage = originalError.message?.replace(
      /^An error occurred: /,
      "",
    );
    // We construct a submission object and map the error message to the empty key (i.e., form error).
    return {
      intent: formData.get("intent") || "",
      payload: Object.fromEntries(formData),
      error: {
        "": [errorMessage],
      },
    } as Submission;
  }
};
export { submissionSchema, getSubmission };
