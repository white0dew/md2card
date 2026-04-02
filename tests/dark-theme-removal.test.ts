import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("dark tech theme is fully removed from the theme registry", async () => {
  const registryText = await readFile(
    new URL("../lib/card-registry.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(registryText, /DarkCard/);
  assert.doesNotMatch(registryText, /darkCard/);
  assert.doesNotMatch(registryText, /暗夜科技/);
  await assert.rejects(access(new URL("../components/cards/DarkCard.tsx", import.meta.url)));
});
