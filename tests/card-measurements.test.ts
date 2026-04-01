import assert from "node:assert/strict";
import test from "node:test";
import { getSocialNoteUsableHeight, SOCIAL_NOTE_RESERVED_HEIGHT } from "@/lib/card-measurements";

test("getSocialNoteUsableHeight reserves vertical space for the social-note header chrome", () => {
  assert.equal(getSocialNoteUsableHeight(587), 587 - SOCIAL_NOTE_RESERVED_HEIGHT);
  assert.equal(getSocialNoteUsableHeight(100), 120);
});
