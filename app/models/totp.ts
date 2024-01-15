import { z } from "zod";
import { getDatabaseInstance } from "~/lib/db.server";

export const TotpTableDefinition = /* surrealql */ `
  DEFINE TABLE totp SCHEMAFULL;

  -- Fields
  DEFINE FIELD otp ON totp TYPE string;
  DEFINE FIELD hash ON totp TYPE string;
  DEFINE FIELD expiresAt ON totp TYPE datetime DEFAULT time::now() + 10m;
  DEFINE FIELD attempts ON totp TYPE number DEFAULT 0; # Not in use currently
  DEFINE FIELD active ON totp TYPE any
      DEFAULT <future>{ attempts < 3 AND expiresAt > time::now() };
  DEFINE FIELD created ON totp TYPE datetime 
      VALUE $before OR time::now() 
      DEFAULT time::now();

  -- Indexes
  DEFINE INDEX otp ON totp FIELDS otp UNIQUE;
`;

export const createTotp = async (otp: string, hash: string) => {
  const db = await getDatabaseInstance();
  const [totp] = await db.query<Totp | null>(
    /* surrealql */ `
    CREATE ONLY totp CONTENT {
      otp: $otp,
      hash: $hash
    };
  `,
    { otp, hash },
  );

  return totp;
};

export const updateTotp = async (
  id: string,
  data: Partial<
    Pick<Totp, "active" | "attempts" | "expiresAt" | "otp" | "hash">
  >,
) => {
  const db = await getDatabaseInstance();
  const [totp] = await db.query<Totp | null>(
    /* surrealql */ `
    UPDATE totp MERGE {
      otp: IF $otp IS NOT NONE { $otp } ELSE { otp },
      hash: IF $hash IS NOT NONE { $hash } ELSE { hash },
      active: IF $active IS NOT NONE { $active } ELSE { active },
      attempts: IF $attempts IS NOT NONE { $attempts } ELSE { attempts },
      expiresAt: IF $expiresAt IS NOT NONE { $expiresAt } ELSE { expiresAt },
    } WHERE id = $id;
  `,
    { id, ...data },
  );

  return totp;
};

export const deleteTotp = async (id: string) => {
  const db = await getDatabaseInstance();
  await db.query(
    /* surrealql */ `
    DELETE FROM totp WHERE id = $id
  `,
    { id },
  );
};

export const getTotp = async (otp: string) => {
  const db = await getDatabaseInstance();
  const [totp] = await db.query<Totp | null>(
    /* surrealql */ `
    SELECT * FROM totp WHERE otp = $otp;
  `,
    { otp },
  );

  return totp;
};

export const Totp = z.object({
  id: z.string().startsWith("totp:"),
  otp: z.string(),
  hash: z.string(),
  expiresAt: z.string().datetime(),
  attempts: z.number(),
  active: z.boolean(),
  created: z.string().datetime(),
});
export type Totp = z.infer<typeof Totp>;
