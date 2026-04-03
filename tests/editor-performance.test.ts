import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("editor pane buffers persisted writes instead of writing on every Monaco change", async () => {
  const source = await readFile(
    new URL("../components/workbench/editor-pane.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /draftContent/);
  assert.match(source, /window\.setTimeout/);
  assert.match(source, /window\.clearTimeout/);
  assert.doesNotMatch(source, /onChange=\{\(value\) => setContent\(value \?\? ""\)\}/);
});
