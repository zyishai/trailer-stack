import { getDatabaseInstance } from "~/lib/db.server";
import argon2 from "argon2";
import { startMeasurement } from "~/lib/utils.server";

const TableName = {
  User: "user",
  Credential: "credential",
} as const;

export interface User {
  id: string;
  username: string;
  email: string;
}

interface Credential {
  id: string;
  userId: string;
  hashedPassword: string;
}

export async function verifyUser(creds: {
  username: string;
  password: string;
}) {
  const user = await getUserByUsername(creds.username);
  if (!user) {
    throw new Error("Invalid username or password");
  }

  const savedCreds = await getUserCredentials(user.id);
  if (!savedCreds?.hashedPassword) {
    console.warn(`⚠️ Missing hashed password for user ${user.id}`);
    throw new Error("Invalid username or password");
  }
  const isCorrectPassword = await argon2.verify(
    savedCreds.hashedPassword,
    creds.password,
    { type: argon2.argon2id },
  );
  if (!isCorrectPassword) {
    throw new Error("Invalid username or password");
  }

  return user;
}

export async function createNewUser(data: {
  username: string;
  password: string;
  email: string;
}) {
  const db = await getDatabaseInstance();

  const userByUsername = await getUserByUsername(data.username);
  if (userByUsername) {
    throw new Error("Authentication error", {
      cause: { username: "Username taken" },
    });
  }

  const userByEmail = await getUserByUsername(data.email);
  if (userByEmail) {
    throw new Error("Authentication error", {
      cause: { email: "Email already registered" },
    });
  }

  // @see: https://stytch.com/blog/argon2-vs-bcrypt-vs-scrypt/ and https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
  const finishMeasure = startMeasurement("Hash");
  const hashedPassword = await argon2.hash(data.password, {
    type: argon2.argon2id,
  });
  const measurement = finishMeasure();
  if (measurement.duration > 1500 /* 1.5 sec */) {
    console.warn(
      `⚠️ Argon2 took ${measurement.duration / 1000} seconds to hash.`,
    );
  }

  const [createdUser] = (await db.query(
    `CREATE ${TableName.User} SET username = $username, email = $email`,
    { ...data },
  )) as User[];
  if (!createdUser) {
    console.warn(`⚠️ Registration failed: failed to create new user`);
    throw new Error("Registration failed");
  }
  const [createdCredential] = await db.query(
    `CREATE ${TableName.Credential} SET userId = $userId, hashedPassword = $hashedPassword`,
    {
      hashedPassword,
      userId: createdUser.id,
    },
  );
  if (!createdCredential) {
    console.warn(
      `⚠️ Registration failed: failed to create Credential object for user ${createdUser.id}. Attempting to delete user...`,
    );

    // attempt to delete already-created user
    await db.delete(createdUser.id);
    console.warn(`⚠️ User ${createdUser.id} deleted successfully.`);

    throw new Error("Registration failed");
  }

  return createdUser;
}

export async function getUserById(userId: string) {
  const db = await getDatabaseInstance();
  const [user] = (await db.query(
    `SELECT * from ${TableName.User} WHERE id = $userId`,
    { userId },
  )) as (User | undefined)[];
  return user ? user : null;
}

export async function getUserByUsername(username: string) {
  const db = await getDatabaseInstance();
  const [user] = (await db.query(
    `SELECT * from ${TableName.User} WHERE username = $username`,
    { username },
  )) as (User | undefined)[];
  return user ? user : null;
}

export async function getUserByEmail(email: string) {
  const db = await getDatabaseInstance();
  const [user] = (await db.query(
    `SELECT * from ${TableName.User} WHERE email = $email`,
    { email },
  )) as (User | undefined)[];
  return user ? user : null;
}

export async function getUserCredentials(userId: string) {
  const db = await getDatabaseInstance();
  const [cred] = (await db.query(
    `SELECT * from ${TableName.Credential} WHERE userId = $userId`,
    { userId },
  )) as (Credential | undefined)[];
  return cred ? cred : null;
}
