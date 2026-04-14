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

test("social-note theme gives h2 h3 and h4 distinct font sizes", async () => {
  const cardText = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );

  const h2FontSize = cardText.match(/\.md-h2\s*\{[^}]*font-size:\s*([^;]+);/s)?.[1]?.trim();
  const h3FontSize = cardText.match(/\.md-h3\s*\{[^}]*font-size:\s*([^;]+);/s)?.[1]?.trim();
  const h4FontSize = cardText.match(/\.md-h4\s*\{[^}]*font-size:\s*([^;]+);/s)?.[1]?.trim();

  assert.ok(h2FontSize, "expected social-note theme to define .md-h2 font-size");
  assert.ok(h3FontSize, "expected social-note theme to define .md-h3 font-size");
  assert.ok(h4FontSize, "expected social-note theme to define .md-h4 font-size");
  assert.notStrictEqual(h2FontSize, h3FontSize);
  assert.notStrictEqual(h3FontSize, h4FontSize);
});

test("social-note theme gives body h1 a larger title size", async () => {
  const cardText = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );

  const h1FontSize = cardText.match(/\.md-h1\s*\{[^}]*font-size:\s*([^;]+);/s)?.[1]?.trim();

  assert.equal(h1FontSize, "27px");
});
