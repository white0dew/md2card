import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("persist hydration hook does not trigger extra manual rehydrate cycles", async () => {
  const source = await readFile(
    new URL("../hooks/use-persist-hydration.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /persist\.rehydrate\?/);
  assert.doesNotMatch(source, /Promise\.resolve\(rehydrationResult\)/);
});

test("settings store recovers from corrupted persisted state", async () => {
  const source = await readFile(
    new URL("../stores/settings-store.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /onRehydrateStorage/);
  assert.match(source, /clearStorage\(\)/);
  assert.match(source, /rehydrate\(\)/);
});

test("editor store recovers from corrupted persisted state", async () => {
  const source = await readFile(
    new URL("../stores/editor-store.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /onRehydrateStorage/);
  assert.match(source, /clearStorage\(\)/);
  assert.match(source, /rehydrate\(\)/);
});
