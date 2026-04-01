import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("card registry includes the social-note theme", async () => {
  const registryText = await readFile(new URL("../lib/card-registry.ts", import.meta.url), "utf8");
  const cardText = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );
  assert.match(registryText, /socialNoteCard/);
  assert.match(cardText, /社交图文/);
});
