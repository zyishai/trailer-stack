import { glob } from "glob";
import { join, basename, normalize } from "node:path";
import esbuild from "esbuild";

export function getTemplatesDir() {
  return join(process.cwd(), process.env.EMAIL_TEMPLATES_DIR);
}

export async function getTemplatesNames() {
  const emailsDir = join(process.cwd(), process.env.EMAIL_TEMPLATES_DIR);
  const templatePaths = await glob(`${emailsDir}/*.tsx`);
  return templatePaths.map(path => basename(path).split(".")[0]);
}

type CompileTemplateProps = {
  templateName: string;
  write?: boolean;
  tsconfig?: string;
  outDir?: string;
};
export async function compileTemplate({
  templateName,
  write = false,
  tsconfig = join(process.cwd(), "tsconfig.json"),
  outDir = process.cwd(),
}: CompileTemplateProps) {
  const buildId = Date.now();
  const templatesDir = getTemplatesDir();
  const templatePath = normalize(`${templatesDir}/${templateName}.tsx`);
  const buildResult = await esbuild.build({
    entryPoints: [templatePath],
    entryNames: `[name]-${buildId}`,
    bundle: true,
    platform: "node",
    write,
    tsconfig,
    outdir: outDir,
    outExtension: {
      ".js": ".cjs",
    },
  });

  if (buildResult.errors.length > 0) {
    console.error(buildResult.errors);
    throw new Error(
      `🚨 esbuild encountered error(s) while trying to build template. Template Name: ${templateName}.`,
    );
  }

  if (buildResult.warnings.length > 0) {
    console.warn(`⚠️ esbuild finished with the following warnings:`);
    console.warn(buildResult.warnings);
  }

  const outFilePath = normalize(`${outDir}/${templateName}-${buildId}.cjs`);
  return {
    out: outFilePath,
    buildId,
    outHash: buildResult.outputFiles?.[0].hash,
  };
}
