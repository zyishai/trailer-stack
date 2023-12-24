import { Surreal } from "surrealdb.node";

export const tags: String[] = [];

export async function migrate(db: Surreal) {
  Object.setPrototypeOf(db, Surreal.prototype);
}

export async function rollback(db: Surreal) {
  Object.setPrototypeOf(db, Surreal.prototype);
}
