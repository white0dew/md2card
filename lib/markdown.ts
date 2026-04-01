import { marked, type Renderer } from "marked";

export async function parseMarkdown(markdown: string, renderer: Renderer) {
  const parsed = await marked.parse(markdown, { renderer });
  return typeof parsed === "string" ? parsed : "";
}
