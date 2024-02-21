/**
 * This module deals with error handling across
 * the data (i.e., models) and business (i.e., loaders and actions) layers of the stack.
 * It exposes set of methods to transform errors thrown and extract information from them,
 * and also this module exports custom errors for various concerns of the application.
 *
 * @author Yishai Zehavi <zehaviyishai@gmail.com>
 * @created 2/5/2024
 */

import { type Submission } from "@conform-to/react";

// 👉 Error handling methods

export function errorToSubmission(
  submission: Submission,
  error: Error,
): Submission {
  const errorMessage = getClientErrorMessage(error);
  return {
    ...submission,
    error: {
      "": [errorMessage].filter(Boolean),
    },
  };
}

export function getClientErrorMessage(error: Error) {
  if (error instanceof BaseError) {
    return error.message;
  } else {
    return "Unknown server error";
  }
}

export function errorToStatusCode(error: Error) {
  if (error instanceof AuthenticationError) {
    return 400;
  } else {
    return 500;
  }
}

// 👉 Custom errors

// ================================================
// SECTION - Base error class - EDIT AT YOUR OWN RISK!
// ================================================

abstract class BaseError<Code extends string = ""> extends Error {
  constructor(
    codeToErrorMap: Record<Code, string>,
    messageOrCode?: Code,
    options?: ErrorOptions,
  );
  constructor(
    codeToErrorMap: Record<Code, string>,
    messageOrCode?: string,
    options?: ErrorOptions,
  );
  constructor(
    private readonly codeToErrorMap: Record<Code, string>,
    messageOrCode?: Code | string,
    options?: ErrorOptions,
  ) {
    const key =
      messageOrCode && Object.keys(codeToErrorMap).includes(messageOrCode)
        ? (messageOrCode as Code)
        : null;
    const message = key
      ? codeToErrorMap[key]
      : messageOrCode || "Unknown error";
    super(message, options);
  }
}

// ================================================
// SECTION - AuthenticationError
// ================================================

const authenticationErrorMessageMap = {
  USER_NOT_FOUND: "User not found",
  OTP_INVALID: "Invalid OTP",
  OTP_EXPIRED: "OTP is no longer active",
  CREDS_INVALID: "Invalid username or password",
  CREDS_TAKEN: "Username or email are taken",
} as const;
type AuthenticationErrorCode = keyof typeof authenticationErrorMessageMap;
export class AuthenticationError extends BaseError<AuthenticationErrorCode> {
  constructor(message?: AuthenticationErrorCode, options?: ErrorOptions);
  constructor(message?: string, options?: ErrorOptions);
  constructor(
    message?: AuthenticationErrorCode | string,
    options?: ErrorOptions,
  ) {
    super(authenticationErrorMessageMap, message, options);
  }
}

// ================================================
// SECTION - AuthorizationError
// ================================================

const authrErrorMessageMap = {
  ACCESS_DENIED: "You are not allowed to perform this action",
  GRANTING_FAILED: "Failed to grant permission to perform this action",
} as const;
type AuthrErrorCode = keyof typeof authrErrorMessageMap;
export class AuthorizationError extends BaseError<AuthrErrorCode> {
  constructor(message?: AuthrErrorCode, options?: ErrorOptions);
  constructor(message?: string, options?: ErrorOptions);
  constructor(message?: string | AuthrErrorCode, options?: ErrorOptions) {
    super(authrErrorMessageMap, message, options);
  }
}
