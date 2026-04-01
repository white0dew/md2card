import assert from "node:assert/strict";
import test from "node:test";
import { groupTagNamesIntoSections } from "@/lib/pagination-groups";

test("groupTagNamesIntoSections keeps heading sections together", () => {
  assert.deepEqual(
    groupTagNamesIntoSections(["H1", "P", "H2", "UL", "OL", "H3", "TABLE", "H3", "IMG"]),
    [["H1", "P"], ["H2", "UL", "OL"], ["H3", "TABLE"], ["H3", "IMG"]],
  );
});

test("groupTagNamesIntoSections preserves leading content before first heading", () => {
  assert.deepEqual(
    groupTagNamesIntoSections(["P", "P", "H2", "UL"]),
    [["P", "P"], ["H2", "UL"]],
  );
});
