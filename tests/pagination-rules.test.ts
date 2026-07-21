import assert from "node:assert/strict";
import test from "node:test";
import {
  findTrailingKeepWithNextCount,
  findPreferredTextSplitIndex,
  isContentBottomClearlyUnderfilled,
  isAtomicBlockTag,
  isInlineFormattingTag,
  isSafelySplittableTextTag,
  rebalanceTextSplitIndex,
  rebalanceSplitIndex,
  shouldFillUnderfilledPageWithText,
} from "@/lib/pagination-rules";
import { isSafelySplittableTextNode } from "@/lib/paginator-utils";

Object.defineProperty(globalThis, "Node", {
  configurable: true,
  value: { ELEMENT_NODE: 1, TEXT_NODE: 3 },
});

function textNode() {
  return { nodeType: 3 } as Node;
}

function elementNode(tagName: string, childElementCount = 0) {
  return {
    nodeType: 1,
    tagName,
    childElementCount,
    querySelectorAll: () => [],
  } as unknown as Node;
}

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

test("rebalanceTextSplitIndex backfills an underfilled previous page without leaving a tiny tail", () => {
  assert.equal(rebalanceTextSplitIndex(100, 95, 32, true), 68);
});

test("adjacent-page rebalancing only admits ordinary text tags", () => {
  assert.equal(isSafelySplittableTextTag("P"), true);
  assert.equal(isSafelySplittableTextTag("H2"), false);
  assert.equal(isSafelySplittableTextTag("TABLE"), false);
  assert.equal(isSafelySplittableTextTag("BLOCKQUOTE"), false);
});

test("adjacent-page backfill splits only pure text nodes and containers", () => {
  assert.equal(isSafelySplittableTextNode(textNode()), true);
  assert.equal(isSafelySplittableTextNode(elementNode("P")), true);
  assert.equal(isSafelySplittableTextNode(elementNode("SPAN")), true);
  assert.equal(isSafelySplittableTextNode(elementNode("DIV")), true);
});

test("adjacent-page backfill rejects containers with inline semantic elements", () => {
  for (const tagName of ["A", "EM", "DEL", "CODE", "BR", "IMG"]) {
    assert.equal(
      isSafelySplittableTextNode(elementNode("P", 1)),
      false,
      `P containing ${tagName} must not be split through textContent`,
    );
  }
});

test("adjacent-page backfill rejects atomic, heading, list, and table content", () => {
  for (const tagName of ["IMG", "BLOCKQUOTE", "PRE", "TABLE", "HR", "H2", "UL", "OL"]) {
    assert.equal(isSafelySplittableTextNode(elementNode(tagName)), false);
  }
  assert.equal(isSafelySplittableTextNode(elementNode("DIV", 1)), false);
});

test("underfilled pages backfill only a safely splittable normal-text successor", () => {
  assert.equal(
    shouldFillUnderfilledPageWithText({
      canSplit: true,
      hasExistingContent: true,
      incomingIsSafelySplittableText: true,
      isClearlyUnderfilled: isContentBottomClearlyUnderfilled(420, 0, 587),
    }),
    true,
  );
  assert.equal(
    shouldFillUnderfilledPageWithText({
      canSplit: true,
      hasExistingContent: true,
      incomingIsSafelySplittableText: true,
      isClearlyUnderfilled: isContentBottomClearlyUnderfilled(423, 0, 587),
    }),
    false,
  );
});

test("underfilled pages preserve a heading section when its next block is atomic or unsplittable", () => {
  assert.equal(
    shouldFillUnderfilledPageWithText({
      canSplit: true,
      hasExistingContent: true,
      incomingIsSafelySplittableText: false,
      isClearlyUnderfilled: isContentBottomClearlyUnderfilled(300, 0, 587),
    }),
    false,
  );
  assert.equal(
    shouldFillUnderfilledPageWithText({
      canSplit: false,
      hasExistingContent: true,
      incomingIsSafelySplittableText: true,
      isClearlyUnderfilled: isContentBottomClearlyUnderfilled(300, 0, 587),
    }),
    false,
  );
});

test("an unsafe paragraph cannot enter heading carryover or adjacent-page backfill", () => {
  const unsafeParagraph = elementNode("P", 1);
  const incomingIsSafelySplittableText = isSafelySplittableTextNode(unsafeParagraph);

  assert.equal(incomingIsSafelySplittableText, false);
  assert.equal(
    shouldFillUnderfilledPageWithText({
      canSplit: true,
      hasExistingContent: true,
      incomingIsSafelySplittableText,
      isClearlyUnderfilled: true,
    }),
    false,
  );
});

test("table content never enters the adjacent-page text backfill decision", () => {
  const table = elementNode("TABLE");
  const tableContainer = elementNode("DIV", 1);

  for (const node of [table, tableContainer]) {
    assert.equal(isSafelySplittableTextNode(node), false);
    assert.equal(
      shouldFillUnderfilledPageWithText({
        canSplit: true,
        hasExistingContent: true,
        incomingIsSafelySplittableText: isSafelySplittableTextNode(node),
        isClearlyUnderfilled: true,
      }),
      false,
    );
  }
});
