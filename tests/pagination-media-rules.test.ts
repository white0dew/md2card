import assert from "node:assert/strict";
import test from "node:test";
import { isImageContainerTag } from "@/lib/pagination-rules";

test("isImageContainerTag treats markdown image paragraphs as atomic image blocks", () => {
  assert.equal(isImageContainerTag("P", ["IMG"]), true);
  assert.equal(isImageContainerTag("P", ["IMG", "BR"]), false);
  assert.equal(isImageContainerTag("DIV", ["IMG"]), false);
});
