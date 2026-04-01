import assert from "node:assert/strict";
import test from "node:test";
import {
  extractExportButtonRef,
  findMissingLines,
  normalizeForContainment,
} from "@/lib/export-verification";

test("normalizeForContainment removes OCR whitespace noise", () => {
  assert.equal(
    normalizeForContainment("不是它 “乱花” 。"),
    normalizeForContainment("不是它“乱花”。"),
  );
});

test("findMissingLines reports lines absent from exported OCR text", () => {
  assert.deepEqual(
    findMissingLines(
      "这也是为什么，OpenClaw 的 token 消耗会比较快。\n不是它“乱花”。\n而是它在模型前面，先塞了很多层上下文进去。",
      "这也是为什么，OpenClaw 的 token 消耗会比较快。\n而是它在模型前面，先塞了很多层上下文进去。",
    ),
    ["不是它“乱花”。"],
  );
});

test("findMissingLines tolerates OCR-inserted spaces", () => {
  assert.deepEqual(
    findMissingLines(
      "不是它“乱花”。",
      "不 是 它 “乱花” 。",
    ),
    [],
  );
});

test("findMissingLines tolerates a single OCR character mistake", () => {
  assert.deepEqual(
    findMissingLines(
      "如果你把这些内容都算上，token 的消耗高其实就不奇怪了。",
      "如果你把这些内容都算上，token 的消耗高其实就不奇径了。",
    ),
    [],
  );
});

test("extractExportButtonRef finds the export button ref from agent-browser snapshot output", () => {
  assert.equal(
    extractExportButtonRef('- button "导出 PNG / ZIP" [ref=e1]'),
    "e1",
  );
});
