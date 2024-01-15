import { z } from "zod";
import { EmailAddress } from "./email";
import { Username } from "./username";
import { getDatabaseInstance } from "~/lib/db.server";

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

  -- Events

  DEFINE EVENT user_deleted ON TABLE user WHEN $event = "DELETE" THEN {
    DELETE FROM credential WHERE user_id = $before.id;
    DELETE FROM authenticator WHERE userId = $before.id
  };
`;

export const getUserById = async (id: string) => {
  const db = await getDatabaseInstance();

  const [user] = await db.query<User | null>(
    /* surrealql */ `
    SELECT * FROM user WHERE id = $id;
  `,
    { id },
  );

  return user;
};

export const getUserByEmailAddress = async (email: EmailAddress) => {
  const db = await getDatabaseInstance();

  const [user] = await db.query<User | null>(
    /* surrealql */ `
    BEGIN TRANSACTION;

    LET $users = SELECT * FROM user WHERE email = $email;

    RETURN IF $users[0].id {
      $users[0]
    } ELSE {
      NULL
    };

    COMMIT TRANSACTION;
  `,
    { email },
  );

  return user;
};

export const getUserByUsername = async (username: Username) => {
  const db = await getDatabaseInstance();

  const [user] = await db.query<User | null>(
    /* surrealql */ `
    BEGIN TRANSACTION;

    LET $users = SELECT * FROM user WHERE username = $username;

    RETURN IF $users[0].id {
      $users[0]
    } ELSE {
      NULL
    };

    COMMIT TRANSACTION;
  `,
    { username },
  );

  return user;
};

export const User = z.object({
  id: z.string().startsWith("user:"),
  username: z.string(),
  email: EmailAddress,
  created: z.string().datetime(),
});

export type User = z.infer<typeof User>;
