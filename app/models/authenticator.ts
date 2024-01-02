import { z } from "zod";

export const AuthenticatorTableDefinition = /* surrealql */ `
  BEGIN TRANSACTION;

  DEFINE TABLE authenticator SCHEMAFULL;

  -- Fields

  DEFINE FIELD credentialID ON authenticator TYPE string;

  DEFINE FIELD userId ON authenticator TYPE record<user>;

  DEFINE FIELD credentialPublicKey ON authenticator TYPE string;

  DEFINE FIELD counter ON authenticator TYPE number;

  DEFINE FIELD credentialDeviceType ON authenticator TYPE string;

  DEFINE FIELD credentialBackedUp ON authenticator TYPE bool;

  DEFINE FIELD transports ON authenticator TYPE array;

  -- Indexes

  DEFINE INDEX credentialID ON TABLE authenticator FIELDS credentialID;

  DEFINE INDEX userId ON TABLE authenticator FIELDS userId;

  COMMIT TRANSACTION;
`;

// @see app/lib/auth/strategies/authn/strategy.ts#verify
// export const registerDevice = /* surrealql */ `
//   BEGIN TRANSACTION;

//   RETURN CREATE authenticator CONTENT {
//     credentialID: $credentialID,
//     userId: $userId,
//     credentialPublicKey: $credentialPublicKey,
//     counter: $counter,
//     credentialDeviceType: $credentialDeviceType,
//     credentialBackedUp: $credentialBackedUp,
//     transports: $transports
//   };

//   COMMIT TRANSACTION;
// `;

export const getUserAuthenticators = /* surrealql */ `
  BEGIN TRANSACTION;

  RETURN SELECT * FROM authenticator WHERE userId = $userId;

  COMMIT TRANSACTION;
`;

export const getAuthenticatorById = /* surrealql */ `
    BEGIN TRANSACTION;

    LET $authrs = SELECT * FROM authenticator WHERE credentialID = $id;

    RETURN IF $authrs[0].credentialID {
      $authrs[0]
    } ELSE {
      THROW "Authenticator not registered"
    };

    COMMIT TRANSACTION;
`;

export const Authenticator = z.object({
  credentialID: z.string(),
  userId: z.string().startsWith("user:"),
  credentialPublicKey: z.string(),
  counter: z.number(),
  credentialDeviceType: z.string(),
  credentialBackedUp: z.boolean(),
  transports: z.array(z.string()),
});
export type Authenticator = z.infer<typeof Authenticator>;
