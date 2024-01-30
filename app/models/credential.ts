import { z } from "zod";
import { getDatabaseInstance } from "~/lib/db.server";
import { Password } from "./password";

// prettier-ignore
export const CredentialTableSchema = /* surrealql */`
  DEFINE TABLE credential SCHEMAFULL;

  -- Fields

  DEFINE FIELD user ON credential TYPE record<user>;

  DEFINE FIELD password ON credential TYPE string
    VALUE crypto::argon2::generate($value);

  DEFINE FIELD created ON credential TYPE datetime VALUE $before OR time::now() DEFAULT time::now();

  -- Indexes

  DEFINE INDEX user ON credential FIELDS user UNIQUE;
`;

export const updateCredential = async (userId: string, password: Password) => {
  const db = await getDatabaseInstance();
  const [credential] = await db.query<UserCredential>(
    /* surrealql */ `
    UPDATE credential SET password = $password WHERE user = $userId;
  `,
    { userId, password },
  );
  return credential;
};

export const UserCredential = z.object({
  id: z.string().startsWith("credential:"),
  user_id: z.string().startsWith("user:"),
  password: Password,
  created: z.string().datetime(),
});
export type UserCredential = z.infer<typeof UserCredential>;
