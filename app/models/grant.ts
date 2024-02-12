import { z } from "zod";
import { getDatabaseInstance } from "~/lib/db.server";
import { AuthrEntity, AuthrSubject, Fields } from "~/lib/authorization/types";

export const GrantsTablesDefinition = /* surrealql */ `
  # Table Definition: can_read

  DEFINE TABLE can_read SCHEMAFULL;

  -- Fields

  DEFINE FIELD in ON can_read TYPE record;
  DEFINE FIELD out ON can_read TYPE record;
  DEFINE FIELD fields ON can_read TYPE array<string>;
  DEFINE FIELD constraints ON can_read TYPE array<string> DEFAULT [];
  DEFINE FIELD expires ON can_read TYPE option<datetime>;

  -- Indexes
  DEFINE INDEX can_read ON TABLE can_read COLUMNS in, out UNIQUE;

  ---

  # Table Definition: can_update

  DEFINE TABLE can_update SCHEMAFULL;

  -- Fields

  DEFINE FIELD in ON can_update TYPE record;
  DEFINE FIELD out ON can_update TYPE record;
  DEFINE FIELD fields ON can_update TYPE array<string>;
  DEFINE FIELD constraints ON can_update TYPE array<string> DEFAULT [];
  DEFINE FIELD expires ON can_read TYPE option<datetime>;

  -- Indexes
  DEFINE INDEX can_update ON TABLE can_update COLUMNS in, out UNIQUE;

  ---

  # Table Definition: can_delete

  DEFINE TABLE can_delete SCHEMAFULL;

  -- Fields

  DEFINE FIELD in ON can_delete TYPE record;
  DEFINE FIELD out ON can_delete TYPE record;
  DEFINE FIELD constraints ON can_delete TYPE array<string> DEFAULT [];
  DEFINE FIELD expires ON can_read TYPE option<datetime>;

  -- Indexes
  DEFINE INDEX can_delete ON TABLE can_delete COLUMNS in, out UNIQUE;
`;

export async function getMaybeReadGrant(
  subject: AuthrSubject,
  object: AuthrEntity,
  fields?: Fields,
): Promise<Maybe<CanReadGrant>> {
  const db = await getDatabaseInstance();

  const [grant] = await db.query<CanReadGrant | null>(
    /* surrealql */ `
    SELECT ->can_read[0].* as grant FROM $subject WHERE ->can_read[WHERE fields CONTAINS "*" OR $fields ALLINSIDE fields].out CONTAINS $object;
  `,
    {
      subject: subject.id,
      object: object.id,
      fields: !fields || fields === "*" ? ["*"] : fields,
    },
  );

  return grant;
}

export async function getMaybeUpdateGrant(
  subject: AuthrSubject,
  object: AuthrEntity,
  fields?: Fields,
): Promise<Maybe<CanUpdateGrant>> {
  const db = await getDatabaseInstance();

  const [grant] = await db.query<CanUpdateGrant | null>(
    /* surrealql */ `
    SELECT ->can_update[0].* as grant FROM $subject WHERE ->can_update[WHERE fields CONTAINS "*" OR $fields ALLINSIDE fields].out CONTAINS $object;
  `,
    {
      subject: subject.id,
      object: object.id,
      fields: !fields || fields === "*" ? ["*"] : fields,
    },
  );

  return grant;
}

export async function getMaybeDeleteGrant(
  subject: AuthrSubject,
  object: AuthrEntity,
): Promise<Maybe<CanDeleteGrant>> {
  const db = await getDatabaseInstance();

  const [grant] = await db.query<CanDeleteGrant | null>(
    /* surrealql */ `
    SELECT ->can_delete[0].* as grant FROM $subject WHERE ->can_delete.out CONTAINS $object;
  `,
    { subject: subject.id, object: object.id },
  );

  return grant;
}

export const CanReadGrant = z.object({
  id: z.string().startsWith("can_read"),
  in: z.string(),
  out: z.string(),
  fields: z.array(z.string()).optional(),
  constraints: z.array(z.string()),
});
export const CanUpdateGrant = z.object({
  id: z.string().startsWith("can_update"),
  in: z.string(),
  out: z.string(),
  fields: z.array(z.string()).optional(),
  constraints: z.array(z.string()),
});
export const CanDeleteGrant = z.object({
  id: z.string().startsWith("can_delete"),
  in: z.string(),
  out: z.string(),
  fields: z.array(z.string()).optional(),
  constraints: z.array(z.string()),
});

export type CanReadGrant = z.infer<typeof CanReadGrant>;
export type CanUpdateGrant = z.infer<typeof CanUpdateGrant>;
export type CanDeleteGrant = z.infer<typeof CanDeleteGrant>;

/**
 * Example record:
 *
 *  {
 *    "id": "can_read:ctwsll49k37a7rmqz9rr"
 *    "in": "auth_token:l19zjikkw1p1h9o6ixrg",
 *    "out": "credential:8nkk6uj4yprt49z7y3zm",
 *    "fields": ["password"],                   <- set to NONE to allow access for *all* fields
 *    "constraints": ["SOURCE_IS_ACTIVE"]       <- list of keys to rules that should be checked server-side
 *  }
 */
