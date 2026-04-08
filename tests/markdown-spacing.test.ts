import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createMarkdownRenderer } from "@/components/cards/create-themed-card";
import { parseMarkdown } from "@/lib/markdown";

const blockSpacingMarkdown = [
  "第一段文字",
  "",
  "## 小标题",
  "第二段文字",
].join("\n");

test("shared themed renderer does not turn blank block spacing into extra br nodes", async () => {
  const html = await parseMarkdown(blockSpacingMarkdown, createMarkdownRenderer());

  assert.doesNotMatch(html, /<br\s*\/?>\s*<h2/);
  assert.doesNotMatch(html, /<\/p>\s*<br/);
});

test("theme-specific renderers do not map markdown block spacing to explicit br tags", async () => {
  const socialSource = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );
  const defaultSource = await readFile(
    new URL("../components/cards/DefaultCard.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(socialSource, /render\.space\s*=\s*function\s*\(\)\s*\{\s*return\s+"<br\s*\/?>"/);
  assert.doesNotMatch(defaultSource, /render\.space\s*=\s*function\s*\(\)\s*\{\s*return\s+"<br\s*\/?>"/);
});
