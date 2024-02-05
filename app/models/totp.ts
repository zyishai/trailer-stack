import { z } from "zod";
import { getDatabaseInstance } from "~/lib/db.server";
import { User } from "./user";

export const TotpTableDefinition = /* surrealql */ `
  DEFINE TABLE totp SCHEMAFULL;

  -- Fields

  DEFINE FIELD algorithm ON totp TYPE string;
  DEFINE FIELD charSet ON totp TYPE string;
  DEFINE FIELD digits ON totp TYPE number;
  DEFINE FIELD period ON totp TYPE number;
  DEFINE FIELD secret ON totp TYPE string;

  DEFINE FIELD user ON totp TYPE record<user>;
  
  DEFINE FIELD expires ON totp TYPE datetime 
        DEFAULT time::now() + 10m;
  
  DEFINE FIELD attempts ON totp TYPE number 
        DEFAULT 0;

  DEFINE FIELD active ON totp TYPE any
        DEFAULT <future>{ attempts < 3 AND expires > time::now() };

  DEFINE FIELD created ON totp TYPE datetime 
      VALUE $before OR time::now()
      DEFAULT time::now();

  -- Indexes
`;

export async function createTOTP(
  payload: Pick<Totp, "algorithm" | "charSet" | "digits" | "period" | "secret">,
  userId: string,
) {
  const db = await getDatabaseInstance();
  const [totp] = await db.query<Totp>(
    /* surrealql */ `
    BEGIN TRANSACTION;
      LET $otp = CREATE ONLY totp CONTENT {
        algorithm: $algorithm,
        charSet: $charSet,
        digits: $digits,
        period: $period,
        secret: $secret,
        user: $userId
      };
      RETURN SELECT * FROM $otp.id FETCH user;
    COMMIT TRANSACTION;
  `,
    { userId, ...payload },
  );
  return totp;
}

export async function getTOTP(id: string) {
  const db = await getDatabaseInstance();
  const [totp] = await db.query<Totp | null>(
    /* surrealql */ `
    SELECT * FROM totp WHERE id = $id FETCH user;
  `,
    { id },
  );
  return totp;
}

export async function deactivateTOTP(id: string) {
  const db = await getDatabaseInstance();
  const [totp] = await db.query<Totp | null>(
    /* surrealql */ `
    BEGIN TRANSACTION;
      LET $otp = UPDATE totp SET active = false WHERE id = $id;
      RETURN SELECT * FROM $otp.id FETCH user;
    COMMIT TRANSACTION;
  `,
    { id },
  );
  return !!totp;
}

export async function recordFailedAttempt(id: string) {
  const db = await getDatabaseInstance();
  const [totp] = await db.query<Totp | null>(
    /* surrealql */ `
    BEGIN TRANSACTION;
      LET $otp = UPDATE totp SET attempts += 1 WHERE id = $id;
      RETURN SELECT * FROM $otp.id FETCH user;
    COMMIT TRANSACTION;
  `,
    { id },
  );
  return !!totp;
}

export const Totp = z.object({
  id: z.string().startsWith("totp:"),
  algorithm: z.string(),
  charSet: z.string(),
  digits: z.number(),
  period: z.number(),
  secret: z.string(),
  user: User,
  expires: z.string().datetime(),
  attempts: z.number(),
  active: z.boolean(),
  created: z.string().datetime(),
});
export type Totp = z.infer<typeof Totp>;
