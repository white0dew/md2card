import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("default card keeps decorative badges within the export bounds", async () => {
  const source = await readFile(
    new URL("../components/cards/DefaultCard.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /top:\s*-\d+px;\s*\n\s*left:\s*-\d+px;/);
  assert.doesNotMatch(source, /top:\s*-\d+px;\s*\n\s*right:\s*-\d+px;/);
});

test("export verification reads the same page nodes as the export pipeline", async () => {
  const source = await readFile(
    new URL("../scripts/verify-export.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /querySelectorAll\("\.pages-wrapper > \*"\)/);
  assert.doesNotMatch(source, /querySelectorAll\("#preview article"\)/);
});
