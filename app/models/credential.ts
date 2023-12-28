// prettier-ignore
export const CredentialTableSchema = /* surrealql */`
  DEFINE TABLE credential SCHEMAFULL;

  -- Fields

  DEFINE FIELD user_id ON credential TYPE record<user>;

  DEFINE FIELD password ON credential TYPE string
    VALUE crypto::argon2::generate($value);

  DEFINE FIELD created ON credential TYPE datetime VALUE $before OR time::now() DEFAULT time::now();

  -- Indexes

  DEFINE INDEX user_id ON credential FIELDS user_id UNIQUE;
`;
