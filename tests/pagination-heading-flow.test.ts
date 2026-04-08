import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("paginated viewer checks whether a heading section can continue with split text before moving the whole section", async () => {
  const source = await readFile(
    new URL("../lib/paginated-markdown-viewer.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /canTextNodeSplitOnCurrentPage/);
  assert.match(source, /isHeadingTagName/);
});

test("paginator utils exposes text split detection for heading continuation decisions", async () => {
  const source = await readFile(
    new URL("../lib/paginator-utils.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /export function canTextNodeSplitOnCurrentPage/);
  assert.match(source, /findTextSplit\(/);
});
