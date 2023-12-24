import { Surreal } from "surrealdb.node";

let db: Surreal;

if (process.env.NODE_ENV === "production") {
  db = new Surreal();
} else {
  if (!global.db) {
    global.db = new Surreal();
  }
  db = global.db;
}

export async function getDatabaseInstance() {
  return db
    .health()
    .then(() => db)
    .catch(async () => {
      try {
        await db.connect(process.env.DB_ENDPOINT, {
          namespace: process.env.DB_NAMESPACE,
          database: process.env.DB_DATABASE,
        });
        await db.signin({
          namespace: process.env.DB_NAMESPACE,
          database: process.env.DB_DATABASE,
          username: process.env.DB_ROOT_USERNAME,
          password: process.env.DB_ROOT_PASSWORD,
        });
        return db;
      } catch (error: any) {
        console.log(error.message);
        throw error;
      }
    });
}

declare global {
  var db: Surreal | undefined;
}
