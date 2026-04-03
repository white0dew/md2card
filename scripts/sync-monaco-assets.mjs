import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const monacoReactPackageRoot = dirname(
  require.resolve("@monaco-editor/react/package.json"),
);
const monacoVsSource = resolve(monacoReactPackageRoot, "../../monaco-editor/min/vs");
const monacoTargetRoot = resolve(repoRoot, "public/monaco");
const monacoVsTarget = resolve(monacoTargetRoot, "vs");

if (!existsSync(monacoVsSource)) {
  throw new Error(`Cannot find Monaco assets at ${monacoVsSource}`);
}

mkdirSync(monacoTargetRoot, { recursive: true });
rmSync(monacoVsTarget, { force: true, recursive: true });
cpSync(monacoVsSource, monacoVsTarget, { recursive: true });

console.log(`Synced Monaco assets to ${monacoVsTarget}`);
