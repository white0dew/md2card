import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createMarkdownRenderer } from "@/components/cards/create-themed-card";
import { parseMarkdown } from "@/lib/markdown";

test("shared themed renderer preserves link text instead of rendering token objects", async () => {
  const html = await parseMarkdown(
    "Karpathy 推文链接：[查看原文](https://x.com/karpathy/status/1)",
    createMarkdownRenderer(),
  );

  assert.match(html, />查看原文<\/a>/);
  assert.doesNotMatch(html, /\[object Object\]/);
});

test("default and social-note renderers do not interpolate link tokens as objects", async () => {
  const defaultSource = await readFile(
    new URL("../components/cards/DefaultCard.tsx", import.meta.url),
    "utf8",
  );
  const socialSource = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(defaultSource, />\$\{tokens\}<\/a>/);
  assert.doesNotMatch(socialSource, />\$\{tokens\}<\/a>/);
});
