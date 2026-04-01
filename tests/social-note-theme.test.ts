import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("social-note theme only shows the lead meta block on the first page", async () => {
  const cardText = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );

  assert.match(cardText, /pageIndex\s*===\s*0/);
  assert.match(cardText, /showLeadMeta/);
});

test("card props expose pageIndex for paginated themes", async () => {
  const typesText = await readFile(new URL("../lib/card-types.ts", import.meta.url), "utf8");
  assert.match(typesText, /pageIndex\?:\s*number/);
});

test("social-note theme reads profile content from shared social profile config", async () => {
  const cardText = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );

  assert.match(cardText, /useSettingsStore/);
  assert.match(cardText, /resolveSocialProfile/);
});
