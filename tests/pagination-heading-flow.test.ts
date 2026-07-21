import assert from "node:assert/strict";
import test from "node:test";
import { findTrailingKeepWithNextCount } from "@/lib/pagination-rules";

test("a heading stays with its safely splittable following paragraph", () => {
  assert.equal(findTrailingKeepWithNextCount(["P", "H2"], "P"), 1);
});

test("a heading is carried with an atomic successor to avoid an orphan", () => {
  assert.equal(findTrailingKeepWithNextCount(["P", "H2"], "PRE"), 1);
});
