import assert from "node:assert/strict";
import test from "node:test";
import {
  findTrailingKeepWithNextCount,
  findPreferredTextSplitIndex,
  isAtomicBlockTag,
  isInlineFormattingTag,
  rebalanceSplitIndex,
} from "@/lib/pagination-rules";

test("rebalanceSplitIndex avoids leaving a single list item after a heading block", () => {
  assert.equal(rebalanceSplitIndex(3, 1, 2, true), 0);
});

test("rebalanceSplitIndex keeps at least two rows for the next page when possible", () => {
  assert.equal(rebalanceSplitIndex(6, 5, 2, true), 4);
});

test("findTrailingKeepWithNextCount keeps a heading with the following block", () => {
  assert.equal(findTrailingKeepWithNextCount(["P", "H2"], "UL"), 1);
});

test("findTrailingKeepWithNextCount does not move unrelated trailing blocks", () => {
  assert.equal(findTrailingKeepWithNextCount(["P", "UL"], "TABLE"), 0);
});

test("isAtomicBlockTag marks images and blockquotes as non-splittable blocks", () => {
  assert.equal(isAtomicBlockTag("IMG"), true);
  assert.equal(isAtomicBlockTag("BLOCKQUOTE"), true);
  assert.equal(isAtomicBlockTag("P"), false);
});

test("isInlineFormattingTag marks strong as formatting that must be preserved", () => {
  assert.equal(isInlineFormattingTag("STRONG"), true);
  assert.equal(isInlineFormattingTag("B"), true);
  assert.equal(isInlineFormattingTag("SPAN"), false);
});

test("findPreferredTextSplitIndex prefers punctuation boundaries for Chinese text", () => {
  assert.equal(findPreferredTextSplitIndex("第一句。第二句继续", 5), 4);
});

test("findPreferredTextSplitIndex keeps the proposed index when no nearby boundary exists", () => {
  assert.equal(findPreferredTextSplitIndex("纯文字没有标点", 4), 4);
});
