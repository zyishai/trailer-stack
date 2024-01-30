import { z } from "zod";
import { getDatabaseInstance } from "~/lib/db.server";
import { User } from "./user";

export const AuthTokenTableDefinition = /* surrealql */ `
  DEFINE TABLE auth_token SCHEMAFULL;

  -- Fields
  DEFINE FIELD value ON auth_token TYPE string;

  DEFINE FIELD expires ON auth_token TYPE datetime 
        DEFAULT time::now() + 10m;

  DEFINE FIELD active ON auth_token TYPE any 
        DEFAULT <future> { time::now() < expires };

  DEFINE FIELD user ON auth_token TYPE option<record<user>>
        DEFAULT NONE;

  -- Indexes
  DEFINE INDEX value ON auth_token FIELDS value UNIQUE;
`;

export async function createToken({
  value,
  userId,
}: {
  value: string;
  userId?: string;
}) {
  const db = await getDatabaseInstance();
  const [token] = await db.query<Token>(
    /* surrealql */ `
    CREATE auth_token SET value = $value, user = $userId;
  `,
    { value, userId },
  );
  return token;
}

export async function disableToken({ value }: { value: string }) {
  const db = await getDatabaseInstance();
  const [token] = await db.query<Token | null>(
    /* surrealql */ `
    UPDATE auth_token SET active = false WHERE value = $value;
  `,
    { value },
  );
  return token;
}

export async function getToken({ value }: { value: string }) {
  const db = await getDatabaseInstance();
  const [token] = await db.query<Token | null>(
    /* surrealql */ `
    SELECT * FROM auth_token WHERE value = $value FETCH user;
  `,
    { value },
  );
  return token;
}

export const Token = z.object({
  id: z.string().startsWith("auth_token:"),
  value: z.string(),
  expires: z.string().datetime(),
  active: z.boolean(),
  user: User.optional(),
});
export type Token = z.infer<typeof Token>;
