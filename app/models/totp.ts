import { z } from "zod";

export const TotpTableDefinition = /* surrealql */ `
  DEFINE TABLE totp SCHEMAFULL;

  -- Fields

  DEFINE FIELD hash ON totp TYPE string;
  DEFINE FIELD active ON totp TYPE bool;
  DEFINE FIELD attempts ON totp TYPE number;
  DEFINE FIELD expiresAt ON totp TYPE datetime;
  DEFINE FIELD created ON totp TYPE datetime VALUE $before OR time::now() DEFAULT time::now();

  -- Indexes

  DEFINE INDEX hash ON totp FIELDS hash UNIQUE;
  DEFINE INDEX expiresAt ON totp FIELDS expiresAt;
`;

export const getTotpByHash = /* surrealql */ `
  BEGIN TRANSACTION;

  RETURN SELECT * FROM totp WHERE hash = $hash;

  COMMIT TRANSACTION;
`;

export const createTotp = /* surrealql */ `
  BEGIN TRANSACTION;

  RETURN CREATE ONLY totp SET hash = $hash, active = $active, attempts = $attempts, expiresAt = $expiresAt;

  COMMIT TRANSACTION;
`;

export const updateTotp = /* surrealql */ `
  BEGIN TRANSACTION;

  RETURN UPDATE totp MERGE {
    active: IF $active IS NOT NONE { $active } ELSE { active },
    attempts: IF $attempts IS NOT NONE { $attempts } ELSE { attempts }
  } WHERE hash = $hash;

  COMMIT TRANSACTION;
`;

export const isTotpActive = /* surrealql */ `
  BEGIN TRANSACTION;

  LET $otps = SELECT * FROM totp WHERE hash = $hash;

  RETURN IF $otps[0].active {
    true
  } ELSE {
    false
  };

  COMMIT TRANSACTION;
`;

export const Totp = z.object({
  hash: z.string(),
  active: z.coerce.boolean(),
  attempts: z.coerce.number(),
  expiresAt: z.coerce.date(),
});

export type Totp = z.infer<typeof Totp>;
export type TotpResponse = Omit<Totp, "expiresAt"> & { expiresAt: string };
