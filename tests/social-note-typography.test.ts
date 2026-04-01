import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("social-note theme keeps body line-height above clipping threshold", async () => {
  const cardText = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(cardText, /\.card-content\s*\{[^}]*line-height:\s*0\./s);
  assert.doesNotMatch(cardText, /\.card-content p\s*\{[^}]*line-height:\s*0\./s);
  assert.doesNotMatch(cardText, /\.md-listitem\s*\{[^}]*line-height:\s*0\./s);
  assert.doesNotMatch(cardText, /\.md-text\s*\{[^}]*line-height:\s*0\./s);
});
