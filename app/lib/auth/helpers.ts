import type { Submission } from "@conform-to/react";
import { ZodType } from "zod";

export function isConformSubmission<T extends ZodType>(
  submission: any,
): submission is Submission<T> {
  if (
    typeof submission.intent === "string" &&
    typeof submission.payload === "object" &&
    !Array.isArray(submission.payload) &&
    typeof submission.error === "object" &&
    !Array.isArray(submission.error) &&
    (typeof submission.value === "object" || !submission.value)
  ) {
    return true;
  }

  return false;
}

export function getSubmissionOrError(error: Error): Submission | string {
  let originalError;
  try {
    originalError = JSON.parse((error.cause as any)?.message ?? "{}");
  } catch {
    originalError = error;
  }

  return isConformSubmission(originalError)
    ? originalError
    : originalError.message?.replace(/^An error occurred: /, "");
}
