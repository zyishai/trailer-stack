import { Surreal } from "surrealdb.node";
import { join } from "node:path";
import * as dotenv from "dotenv";
export default class SurrealAdapter {
  db;
  config;
  constructor(config) {
    dotenv.config();
    this.db = new Surreal();
    this.config = config;
  }
  async connect() {
    await this.db.connect(process.env.DB_ENDPOINT, {
      namespace: process.env.DB_NAMESPACE,
      database: process.env.DB_DATABASE,
    });
    await this.db.signin({
      namespace: process.env.DB_NAMESPACE,
      database: process.env.DB_DATABASE,
      username: process.env.DB_ROOT_USERNAME,
      password: process.env.DB_ROOT_PASSWORD,
    });
    // create migration table (if not exists)
    const dbInfo = await this.db.query("INFO FOR DB");
    const isMigrationTableExists =
      this.config.migrationTable in dbInfo[0]?.tables;
    if (!isMigrationTableExists) {
      await this.db.query(`
      BEGIN TRANSACTION;
      DEFINE TABLE ${this.config.migrationTable} SCHEMAFULL;
      DEFINE FIELD name ON TABLE ${this.config.migrationTable} TYPE string;
      DEFINE FIELD createdAt ON TABLE ${this.config.migrationTable} TYPE datetime DEFAULT time::now();
      COMMIT TRANSACTION;`);
    }
    // East creates new object from whatever is returned from this method and we loose `this` which
    // throws on migrations because we're no longer signed in. This line binds the methods to our instance
    // allowing us to be signed-in in our migrations.
    const boundClient = bindObjectMethods(
      this.db,
      Object.getPrototypeOf(this.db),
    );
    return boundClient;
  }
  async disconnect() {
    await this.db.invalidate();
  }
  getTemplatePath(sourceMigrationExtension) {
    return join(
      this.config.templatesDir,
      `template.${sourceMigrationExtension}`,
    );
  }
  async getExecutedMigrationNames() {
    const records = await this.db.select(this.config.migrationTable);
    return records.map(record => record.name);
  }
  async markExecuted(migrationName) {
    await this.db.create(this.config.migrationTable, { name: migrationName });
  }
  async unmarkExecuted(migrationName) {
    await this.db.query(
      `DELETE ${this.config.migrationTable} WHERE name = ${migrationName}`,
    );
  }
}
function bindObjectMethods(thisArg, obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === "function" ? value.bind(thisArg) : value,
    ]),
  );
}
