import { getDatabaseInstance } from "~/lib/db.server";
import { Password } from "~/models/password";
import { User } from "~/models/user";
import { Username } from "~/models/username";

export const signin = async (username: Username, password: Password) => {
  const db = await getDatabaseInstance();

  // prettier-ignore
  const [user] = await db.query<User | null>(/* surrealql */ `
    BEGIN TRANSACTION;

    LET $users = SELECT * FROM user WHERE username = $username;

    RETURN IF $users[0].id {
      LET $credentials = SELECT * FROM credential WHERE user = $users[0].id AND crypto::argon2::compare(password, $password);

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
