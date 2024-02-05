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
  if (
    [AuthenticationError, SessionError].some(
      errorConstructor => error instanceof errorConstructor,
    )
  ) {
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

const authenticationErrorMessageMap = {
  USER_NOT_FOUND: "User not found",
  OTP_INVALID: "Invalid OTP",
  OTP_EXPIRED: "OTP is no longer active",
  CREDS_INVALID: "Invalid username or password",
  CREDS_TAKEN: "Username or email are taken",
} as const;
type AuthenticationErrorCode = keyof typeof authenticationErrorMessageMap;

export class AuthenticationError extends Error {
  constructor(messageOrCode?: AuthenticationErrorCode, options?: ErrorOptions);
  constructor(messageOrCode?: string, options?: ErrorOptions);
  constructor(
    messageOrCode?: AuthenticationErrorCode | string,
    options?: ErrorOptions,
  ) {
    const key =
      messageOrCode &&
      messageOrCode in Object.keys(authenticationErrorMessageMap)
        ? (messageOrCode as AuthenticationErrorCode)
        : null;
    const message = key
      ? authenticationErrorMessageMap[key]
      : key || "Authentication failed";
    super(message, options);
  }
}
export class SessionError extends Error {}
