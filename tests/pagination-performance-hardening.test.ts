import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("pagination viewer yields between batches and cleans up stale measurement work", async () => {
  const source = await readFile(
    new URL("../lib/paginated-markdown-viewer.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /async function yieldToMainThread/);
  assert.match(source, /await yieldToMainThread\(\)/);
  assert.match(source, /cleanupMeasurementWrapper/);
});

test("pagination measurement caches reusable page shells", async () => {
  const source = await readFile(
    new URL("../lib/pagination-card-measurement.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /__pageShells/);
  assert.match(source, /pageShells\.get/);
  assert.match(source, /pageShells\.set/);
});
