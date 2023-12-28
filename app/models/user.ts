import { z } from "zod";

// prettier-ignore
export const UserTableDefinition = /* surrealql */ `
  DEFINE TABLE user SCHEMAFULL;

  -- Fields

  DEFINE FIELD username ON user TYPE string
    ASSERT string::len($value) >= 4 AND string::len($value) <= 10;

  DEFINE FIELD email ON user TYPE string
    ASSERT string::is::email($value);

  DEFINE FIELD created ON user TYPE datetime VALUE $before OR time::now() DEFAULT time::now();

  -- Indexes

  DEFINE INDEX username ON user FIELDS username UNIQUE;
  DEFINE INDEX email ON user FIELDS email UNIQUE;
`;

export const User = z.object({
  id: z.string().startsWith("user:"),
  username: z.string(),
  email: z.string().email(),
  created: z.date({ coerce: true }),
});

export type User = z.infer<typeof User>;
export type UserResponse = Omit<User, "created"> & { created: string };

export default UserTableDefinition;
