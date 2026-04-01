import assert from "node:assert/strict";
import test from "node:test";
import { getSocialNoteUsableHeight } from "@/lib/card-measurements";

test("getSocialNoteUsableHeight reserves vertical space for the social-note header chrome", () => {
  assert.equal(getSocialNoteUsableHeight(587), 411);
  assert.equal(getSocialNoteUsableHeight(587, 80, 96), 287);
  assert.equal(getSocialNoteUsableHeight(100), 120);
});
