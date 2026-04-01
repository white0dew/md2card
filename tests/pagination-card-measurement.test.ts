import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const cardFiles = [
  "DefaultCard.tsx",
  "DarkCard.tsx",
  "GlassCard.tsx",
  "SocialNoteCard.tsx",
  "WarmCard.tsx",
];

test("card themes expose both outer and inner refs for exact pagination measurement", async () => {
  for (const file of cardFiles) {
    const source = await readFile(
      new URL(`../components/cards/${file}`, import.meta.url),
      "utf8",
    );

    assert.match(source, /contentRef/);
    assert.match(source, /ref=\{contentRef(?:\s+as\s+Ref<[^>]+>)?\}/);
    assert.match(source, /ref=\{containerRef(?:\s+as\s+Ref<[^>]+>)?\}/);
  }
});

test("paginated viewer no longer hardcodes first-page measurement for every page", async () => {
  const source = await readFile(
    new URL("../lib/paginated-markdown-viewer.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /getUsableHeight\?\(pageHeight,\s*0\)/);
});

test("paginated viewer waits for markdown images before measuring page breaks", async () => {
  const source = await readFile(
    new URL("../lib/paginated-markdown-viewer.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /querySelectorAll\("img"\)/);
  assert.match(source, /new Image\(\)/);
});
