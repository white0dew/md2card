import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("shared theme factory exposes markdown renderer and themed card builder", async () => {
  const factoryText = await readFile(
    new URL("../components/cards/create-themed-card.tsx", import.meta.url),
    "utf8",
  );

  assert.match(factoryText, /export function createMarkdownRenderer/);
  assert.match(factoryText, /export function createThemeCard/);
  assert.match(factoryText, /render\.heading/);
  assert.match(factoryText, /render\.table/);
  assert.match(factoryText, /className="card-content"/);
});

test("new themes customize key markdown blocks", async () => {
  const editorialCardText = await readFile(
    new URL("../components/cards/EditorialCard.tsx", import.meta.url),
    "utf8",
  );
  const socialCardText = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );
  const terminalCardText = await readFile(
    new URL("../components/cards/TerminalCard.tsx", import.meta.url),
    "utf8",
  );

  assert.match(editorialCardText, /md-blockquote/);
  assert.match(editorialCardText, /Noto Serif SC/);
  assert.match(socialCardText, /social-verified-badge/);
  assert.match(socialCardText, /md-table/);
  assert.match(terminalCardText, /terminal-notes/);
  assert.match(terminalCardText, /md-pre/);
});
