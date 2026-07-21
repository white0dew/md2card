import assert from "node:assert/strict";
import test from "node:test";
import { getSocialNoteUsableHeight } from "@/lib/card-measurements";

test("getSocialNoteUsableHeight preserves the 176px social-note first-page header reservation", () => {
  assert.equal(587 - getSocialNoteUsableHeight(587), 176);
  assert.equal(getSocialNoteUsableHeight(587, 80, 96), 287);
  assert.equal(getSocialNoteUsableHeight(100), 120);
});
