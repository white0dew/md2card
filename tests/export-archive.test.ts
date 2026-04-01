import assert from "node:assert/strict";
import test from "node:test";
import { buildArchiveName, buildArchiveEntries } from "../lib/export-archive.ts";

test("buildArchiveName appends a timestamp before zip suffix", () => {
  assert.equal(
    buildArchiveName("md2card.png", new Date("2026-04-01T09:08:07")),
    "md2card-20260401090807.zip",
  );
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
