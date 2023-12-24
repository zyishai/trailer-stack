import { MigrationManager } from "east";
import { readFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import * as glob from "glob";
import esbuild from "esbuild";

const main = async () => {
  const manager = new MigrationManager();
  const eastConfigJson = JSON.parse(await readFile(".eastrc", "utf-8"));

  const migrationsDirPath = join(process.cwd(), eastConfigJson.dir);
  const migrationsSourcePaths = await glob.glob(
    join(migrationsDirPath, "*.ts"),
  );

  // compile migrations
  const buildResult = await esbuild.build({
    entryPoints: migrationsSourcePaths,
    write: true,
    outdir: migrationsDirPath,
  });

  if (buildResult.errors.length > 0) {
    console.error(`🚨 esbuild failed compiling migrations`);
    throw buildResult.errors;
  }

  if (buildResult.warnings.length > 0) {
    console.warn(
      `⚠️ esbuild compilied migrations with warning: ${buildResult.warnings}`,
    );
  }

  try {
    await manager.configure();
    await manager.connect();
    await manager.migrate({ status: "new" });
  } catch (error) {
    console.error(`🚨 Migration failed: ${error}`);
  } finally {
    await manager.disconnect();
    await Promise.all(
      migrationsSourcePaths.map(migrationPath =>
        unlink(migrationPath.replace(/ts$/, "js")),
      ),
    );
  }
};

main();
