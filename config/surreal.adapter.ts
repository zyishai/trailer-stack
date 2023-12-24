import type { Adapter, AdapterConstructorParams } from "east";
import { Surreal } from "surrealdb.node";
import { join } from "node:path";
import * as dotenv from "dotenv";

interface AdapterConfig extends AdapterConstructorParams<Surreal> {
  templatesDir: string;
  migrationTable: string;
}

export default class SurrealAdapter implements Adapter<Surreal> {
  private readonly db: Surreal;
  private readonly config: AdapterConfig;

  constructor(config: AdapterConfig) {
    dotenv.config();
    this.db = new Surreal();
    this.config = config;
  }

  async connect(): Promise<Surreal> {
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
    const dbInfo: any[] = await this.db.query("INFO FOR DB");
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
    ) as Surreal;

    return boundClient;
  }
  async disconnect(): Promise<void> {
    await this.db.invalidate();
  }
  getTemplatePath(sourceMigrationExtension: string): string {
    return join(
      this.config.templatesDir,
      `template.${sourceMigrationExtension}`,
    );
  }
  async getExecutedMigrationNames(): Promise<string[]> {
    const records: Array<{ name: string }> = await this.db.select(
      this.config.migrationTable,
    );
    return records.map(record => record.name);
  }
  async markExecuted(migrationName: string): Promise<void> {
    await this.db.create(this.config.migrationTable, { name: migrationName });
  }
  async unmarkExecuted(migrationName: string): Promise<void> {
    await this.db.query(
      `DELETE ${this.config.migrationTable} WHERE name = ${migrationName}`,
    );
  }
}

function bindObjectMethods(thisArg: ThisType<Object>, obj: Object) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === "function" ? value.bind(thisArg) : value,
    ]),
  );
}
