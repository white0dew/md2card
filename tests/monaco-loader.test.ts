import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("configureMonacoLoader points Monaco at the local app route", async () => {
  const calls: unknown[] = [];
  const fakeLoader = {
    config(value: unknown) {
      calls.push(value);
    },
  };

  const { configureMonacoLoader, localMonacoVsPath } = await import("../lib/monaco-loader.ts");
  const result = configureMonacoLoader(fakeLoader);

  assert.equal(localMonacoVsPath, "/monaco/vs");
  assert.equal(result, fakeLoader);
  assert.deepEqual(calls, [{ paths: { vs: "/monaco/vs" } }]);
});

test("build scripts sync local Monaco assets before compiling", async () => {
  const source = await readFile(
    new URL("../package.json", import.meta.url),
    "utf8",
  );
  const packageJson = JSON.parse(source) as {
    scripts?: Record<string, string>;
  };

  assert.equal(packageJson.scripts?.["sync:monaco"], "node scripts/sync-monaco-assets.mjs");
  assert.equal(packageJson.scripts?.prebuild, "pnpm sync:monaco");
});
