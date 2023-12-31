// prettier-ignore
const signin = /* surrealql */ `
  BEGIN TRANSACTION;

  LET $users = SELECT * FROM user WHERE username = $username;

  RETURN IF $users[0].id {
    LET $credentials = SELECT * FROM credential WHERE user_id = $users[0].id AND crypto::argon2::compare(password, $password);

    RETURN IF $credentials[0].id {
        $users[0]
    } ELSE {
        THROW "Invalid username or password";
    }
  } ELSE {
    THROW "Invalid username or password";
  };

  COMMIT TRANSACTION;
`;

// prettier-ignore
const signup = /* surrealql */ `
  BEGIN TRANSACTION;

  LET $users = SELECT * FROM user WHERE username = $username OR email = $email;

  RETURN IF $users[0].id {
      IF $users[0].username = $username {
        THROW "Username taken";
      } ELSE {
        THROW "Email already registered";
      }
  } ELSE {
      LET $user = CREATE ONLY user SET username = $username, email = $email;

      -- Don't worry! On the table we hash the password using crypto::argon2::generate hashing function
      CREATE ONLY credential SET user_id = $user.id, password = $password;

      RETURN $user;
  };

  COMMIT TRANSACTION;
`;

export { signin, signup };
