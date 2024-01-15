import { getDatabaseInstance } from "~/lib/db.server";
import { EmailAddress } from "~/models/email";
import { Password } from "~/models/password";
import { User } from "~/models/user";
import { Username } from "~/models/username";

const signin = async (username: Username, password: Password) => {
  const db = await getDatabaseInstance();

  // prettier-ignore
  const [user] = await db.query<User | null>(/* surrealql */ `
    BEGIN TRANSACTION;

    LET $users = SELECT * FROM user WHERE username = $username;

    RETURN IF $users[0].id {
      LET $credentials = SELECT * FROM credential WHERE user_id = $users[0].id AND crypto::argon2::compare(password, $password);

      RETURN IF $credentials[0].id {
        $users[0]
      } ELSE {
        NULL
      }
    } ELSE {
      NULL
    };

    COMMIT TRANSACTION;
  `, { username, password });

  return user;
};

const signup = async (
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
        IF $users[0].username = $username {
          NULL
        } ELSE {
          NULL
        }
    } ELSE {
        LET $user = CREATE ONLY user SET username = $username, email = $email;

        -- Don't worry! On the table we hash the password using crypto::argon2::generate hashing function
        CREATE ONLY credential SET user_id = $user.id, password = $password;

        RETURN $user;
    };

    COMMIT TRANSACTION;
  `, { username, password, email });

  return user;
};

export { signin, signup };
