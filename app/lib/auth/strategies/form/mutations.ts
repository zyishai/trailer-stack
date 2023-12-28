const signin = /* surrealql */ `
  BEGIN TRANSACTION;

  LET $users = SELECT * FROM user WHERE username = $username AND crypto::argon2::compare(password, $password);

  RETURN IF $users[0].id {
      $users[0]
  } ELSE {
      THROW "Invalid username or password";
  };

  COMMIT TRANSACTION;
`;

const signup = /* surrealql */ `
  BEGIN TRANSACTION;

  LET $users = SELECT * FROM user WHERE username = $username OR email = $email;

  RETURN IF $users[0].id THEN
      IF $users[0].username = $username {
      THROW "Username taken";
      } ELSE {
      THROW "Email already registered";
      }
  ELSE
      CREATE ONLY user CONTENT {
      username: $username,
      password: crypto::argon2::generate($password),
      email: $email
      }
  END;

  COMMIT TRANSACTION;
`;

export { signin, signup };
