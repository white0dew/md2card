import assert from "node:assert/strict";
import test from "node:test";
import { buildArchiveName, buildArchiveEntries } from "../lib/export-archive.ts";

test("buildArchiveName converts png export names to zip", () => {
  assert.equal(buildArchiveName("md2card.png"), "md2card.zip");
});

test("buildArchiveEntries keeps file order for multi-image exports", () => {
  assert.deepEqual(
    buildArchiveEntries([
      { fileName: "md2card-1.png", blob: new Blob(["1"]) },
      { fileName: "md2card-2.png", blob: new Blob(["2"]) },
    ]).map((entry) => entry.fileName),
    ["md2card-1.png", "md2card-2.png"],
  );
});
