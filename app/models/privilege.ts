import { z } from "zod";
import { getDatabaseInstance } from "~/lib/db.server";
import { Datetime } from "./datetime";
import { ConstraintKey } from "~/lib/authorization/constraints";
import { Models } from "~/lib/authorization/types";

export const PrivilegeTableDefinition = /* surrealql */ `
  DEFINE TABLE can SCHEMAFULL;

  -- Fields

  DEFINE FIELD in ON can TYPE record;
  DEFINE FIELD out ON can TYPE record;
  DEFINE FIELD type ON can TYPE string;
  DEFINE FIELD fields ON can TYPE option<array<string>>;
  DEFINE FIELD fields.* ON can TYPE string;
  DEFINE FIELD constraints ON can TYPE array<string> DEFAULT [];
  DEFINE FIELD expires ON can TYPE option<datetime>;
  DEFINE FIELD active ON can TYPE any;

  -- Indexes
  DEFINE INDEX can ON TABLE can COLUMNS in, out, type UNIQUE;
`;

export async function findPrivilege({
  type,
  forId,
  toId,
  fields,
}: {
  type: AccessType;
  forId: string;
  toId: string;
  fields?: string[];
}): Promise<Privilege | undefined> {
  const db = await getDatabaseInstance();
  const [grant] = await db.query<{ grants: Privilege[] } | null>(
    /* surrealql */ `
    SELECT ->can.* as grants FROM $subject WHERE ->can[WHERE type::bool(active) == true AND type == $type AND (fields is NONE OR fields CONTAINS "*" OR fields CONTAINSALL $fields)].out CONTAINS $object;
  `,
    { subject: forId, object: toId, type, fields: !!fields ? fields : ["*"] },
  );
  return grant?.grants?.[0];
}

export async function grantPrivilege<E extends keyof Models = any>(payload: {
  type: AccessType;
  forId: string;
  toId: string;
  fields?: Array<keyof Models[E]>;
  constraints?: ConstraintKey[];
  expires?: string;
}): Promise<Privilege> {
  const db = await getDatabaseInstance();
  const { type, forId, toId, constraints = [] } = payload;
  const fields = type !== "delete" ? payload.fields ?? ["*"] : null;
  const datetime = Datetime.safeParse(payload.expires);
  const expires = datetime.success ? datetime.data : null;

  const [grant] = await db.query<Privilege>(
    /* surrealql */ `
    RELATE $subject->can->$object SET type = $type, fields = $fields, expires = $expires, constraints = $constraints, active = <future>{ expires IS NONE OR time::now() < expires };
  `,
    { subject: forId, object: toId, type, fields, expires, constraints },
  );

  return grant;
}

export async function copyPrivileges({
  sourceId,
  targetId,
}: {
  sourceId: string;
  targetId: string;
}) {
  const db = await getDatabaseInstance();
  await db.query(
    /* surrealql */ `
    UPDATE can SET in = $to WHERE in = $from;
  `,
    { from: sourceId, to: targetId },
  );
}

export async function revokePrivileges({ subjectId }: { subjectId: string }) {
  const db = await getDatabaseInstance();
  await db.query(
    /* surrealql */ `
    DELETE can WHERE in = $target;
  `,
    { target: subjectId },
  );
}

export const Privilege = z.object({
  id: z.string().startsWith("can:"),
  in: z.string(),
  out: z.string(),
  type: z.enum(["read", "update", "delete"]),
  fields: z.array(z.string()).optional(),
  constraints: z.array(z.string()),
  expires: Datetime.optional(),
  active: z.boolean(),
});
export type Privilege = z.infer<typeof Privilege>;
type AccessType = Privilege["type"];

/**
 * Example record:
 *
 *  {
 *    "id": "can_read:ctwsll49k37a7rmqz9rr"
 *    "in": "auth_token:l19zjikkw1p1h9o6ixrg",
 *    "out": "credential:8nkk6uj4yprt49z7y3zm",
 *    "type": "read",
 *    "fields": ["password"],                   <- set to NONE to allow access for *all* fields
 *    "constraints": ["SOURCE_IS_ACTIVE"]       <- list of keys to rules that should be checked server-side
 *  }
 */
