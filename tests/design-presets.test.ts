import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePresetHeight,
  calculatePresetExportSize,
  defaultCanvasSize,
  defaultPresetId,
  inferPreset,
} from "@/lib/design-presets";

test("16:9 preset derives height from width", () => {
  assert.equal(calculatePresetHeight(440, "16:9"), 248);
});

test("xiaohongshu preset derives a 3:4 portrait height from width", () => {
  assert.equal(calculatePresetHeight(1080, "xiaohongshu"), 1440);
});

test("preset inference falls back to custom for unmatched dimensions", () => {
  assert.equal(inferPreset(440, 586), "custom");
});

test("preset inference recognizes 1:1 dimensions", () => {
  assert.equal(inferPreset(440, 440), "1:1");
});

test("preset inference recognizes xiaohongshu portrait dimensions", () => {
  assert.equal(inferPreset(1080, 1440), "xiaohongshu");
});

test("default canvas is aligned with the xiaohongshu short-card preset", () => {
  assert.equal(defaultPresetId, "xiaohongshu");
  assert.deepEqual(defaultCanvasSize, { width: 440, height: 587 });
});

test("preset export size scales the preview to the recommended xiaohongshu width", () => {
  assert.deepEqual(calculatePresetExportSize(440, 1174, "xiaohongshu"), {
    width: 1080,
    height: 2882,
  });
});
