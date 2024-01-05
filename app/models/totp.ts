import { z } from "zod";

export const TotpTableDefinition = /* surrealql */ `
  DEFINE TABLE totp SCHEMALESS;

  -- Fields
  DEFINE FIELD type ON totp TYPE string
    ASSERT $value in ["auth", "reset_password"];

  DEFINE FIELD data ON totp TYPE object;
  
  DEFINE FIELD data.hash ON totp TYPE string;
  DEFINE FIELD data.active ON totp TYPE bool;
  DEFINE FIELD data.expiresAt ON totp TYPE datetime;
  DEFINE FIELD data.* ON totp FLEXIBLE TYPE any;
  DEFINE FIELD created ON totp TYPE datetime VALUE $before OR time::now() DEFAULT time::now();

  -- Indexes

  DEFINE INDEX type ON totp FIELDS type;
  DEFINE INDEX token_hash ON totp FIELDS data.hash UNIQUE;
  DEFINE INDEX token_expiresAt ON totp FIELDS data.expiresAt;
`;

export const getTotpByHash = /* surrealql */ `
  BEGIN TRANSACTION;

  RETURN SELECT * FROM totp WHERE data.hash = $hash;

  COMMIT TRANSACTION;
`;

export const createTotp = /* surrealql */ `
  BEGIN TRANSACTION;

  RETURN CREATE ONLY totp SET type = $type, data = $data;

  COMMIT TRANSACTION;
`;

export const updateTotp = /* surrealql */ `
  BEGIN TRANSACTION;

  RETURN UPDATE totp MERGE {
    data: {
      active: IF $active IS NOT NONE { $active } ELSE { data.active },
      attempts: IF $attempts IS NOT NONE { $attempts } ELSE { data.attempts }
    }
  } WHERE data.hash = $hash;

  COMMIT TRANSACTION;
`;

export const isTotpActive = /* surrealql */ `
  BEGIN TRANSACTION;

  LET $otps = SELECT * FROM totp WHERE data.hash = $hash;

  RETURN IF $otps[0].data.active {
    true
  } ELSE {
    false
  };

  COMMIT TRANSACTION;
`;

export const Totp = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("auth"),
    data: z.object({
      hash: z.string(),
      active: z.coerce.boolean(),
      attempts: z.coerce.number(),
      expiresAt: z.coerce.date(),
    }),
  }),
  z.object({
    type: z.literal("reset_password"),
    data: z.object({
      hash: z.string(),
      active: z.coerce.boolean(),
      expiresAt: z.coerce.date(),
    }),
  }),
]);

export type Totp = z.infer<typeof Totp>;
export type TotpResponse = ReplaceDeep<Totp, "token.expiresAt", string>;
