import { getDatabaseInstance } from "~/lib/db.server";
import { EmailAddress } from "~/models/email";
import { Password } from "~/models/password";
import { User } from "~/models/user";
import { Username } from "~/models/username";

export const signup = async (
  username: Username,
  password: Password,
  email: EmailAddress,
) => {
  const db = await getDatabaseInstance();

  // prettier-ignore
  const [user] = await db.query<User | null>(/* surrealql */ `
    BEGIN TRANSACTION;

    LET $users = SELECT * FROM user WHERE username = $username OR email = $email;

    RETURN IF $users[0].id {
        NULL
    } ELSE {
        LET $user = CREATE ONLY user SET username = $username, email = $email;

        -- Don't worry! On the table we hash the password using crypto::argon2::generate hashing function
        CREATE ONLY credential SET user = $user.id, password = $password;

        RETURN $user;
    };

    COMMIT TRANSACTION;
  `, { username, password, email });

  return user;
};
