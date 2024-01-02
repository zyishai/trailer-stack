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

  # TODO: Add an event that deletes the respective credential entry when the user is deleted
`;

export const verifyUserEmailExists = /* surrealql */ `
  BEGIN TRANSACTION;

  LET $users = SELECT * FROM user WHERE email = $email;

  RETURN IF $users[0].id {
    true
  } ELSE {
    THROW "Email not found";
  };

  COMMIT TRANSACTION;
`;

export const getUserByEmailAddress = /* surrealql */ `
  BEGIN TRANSACTION;

  LET $users = SELECT * FROM user WHERE email = $email;

  RETURN IF $users[0].id {
    $users[0]
  } ELSE {
    THROW "User not found";
  };

  COMMIT TRANSACTION;
`;

export const getUserByUsername = /* surrealql */ `
  BEGIN TRANSACTION;

  LET $users = SELECT * FROM user WHERE username = $username;

  RETURN IF $users[0].id {
    $users[0]
  } ELSE {
    THROW "User not found";
  };

  COMMIT TRANSACTION;
`;

export const getUserById = /* surrealql */ `
  BEGIN TRANSACTION;

  LET $users = SELECT * FROM user WHERE id = $id;

  RETURN IF $users[0].id {
    $users[0]
  } ELSE {
    THROW "User not found";
  };

  COMMIT TRANSACTION;
`;

export const User = z.object({
  id: z.string().startsWith("user:"),
  username: z.string(),
  email: z.string().email(),
  created: z.date({ coerce: true }),
});

export type User = z.infer<typeof User>;
export type UserResponse = Omit<User, "created"> & { created: string };
