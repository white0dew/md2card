import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("next config allows 127.0.0.1 in development origins", async () => {
  const configText = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");

  assert.match(configText, /allowedDevOrigins\s*:/);
  assert.match(configText, /["']127\.0\.0\.1["']/);
});
