import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("card registry includes the social-note and new theme cards", async () => {
  const registryText = await readFile(new URL("../lib/card-registry.ts", import.meta.url), "utf8");
  const socialCardText = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );
  const editorialCardText = await readFile(
    new URL("../components/cards/EditorialCard.tsx", import.meta.url),
    "utf8",
  );
  const terminalCardText = await readFile(
    new URL("../components/cards/TerminalCard.tsx", import.meta.url),
    "utf8",
  );
  const knowledgeCardText = await readFile(
    new URL("../components/cards/KnowledgeCard.tsx", import.meta.url),
    "utf8",
  );

  assert.match(registryText, /socialNoteCard/);
  assert.match(registryText, /editorialCard/);
  assert.match(registryText, /terminalCard/);
  assert.match(registryText, /knowledgeCard/);
  assert.match(socialCardText, /社交图文/);
  assert.match(editorialCardText, /留白文志/);
  assert.match(terminalCardText, /终端纪要/);
  assert.match(knowledgeCardText, /知识卡片/);
});
