#!/usr/bin/env tsx

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { HeadlessPage, withHeadlessPage } from "@/lib/headless-chromium";
import { validateHeadlessInput, type ValidatedHeadlessInput } from "@/lib/headless-input";
import { headlessStatusExpression } from "@/lib/headless-status";

const browserUrl = process.env.IDEACARD_URL ?? "http://127.0.0.1:3000";
const renderReadyTimeoutMs = 30_000;
const renderPollIntervalMs = 100;

type Command = "render" | "validate";
type CliOptions = { command: Command; outputDir?: string };
type ExportedPage = { base64: string; height: number; width: number };

function parseOptions(argv: string[]): CliOptions {
  const [command, ...flags] = argv;
  if (command !== "render" && command !== "validate") throw new Error("用法: ideacard <render|validate> --stdin [--out <dir>]");
  let stdin = false;
  let outputDir: string | undefined;
  for (let index = 0; index < flags.length; index += 1) {
    if (flags[index] === "--stdin") stdin = true;
    else if (flags[index] === "--out" && flags[index + 1]) {
      outputDir = resolve(flags[index + 1]);
      index += 1;
    } else throw new Error(`未知或不完整的参数: ${flags[index]}`);
  }
  if (!stdin) throw new Error("必须使用 --stdin 提供 JSON 输入。");
  if (command === "render" && !outputDir) throw new Error("render 命令必须提供 --out <dir>。");
  if (command === "validate" && outputDir) throw new Error("validate 命令不接受 --out 参数。");
  return { command, outputDir };
}

async function readInput() {
  let value = "";
  for await (const chunk of process.stdin) value += chunk;
  if (!value.trim()) throw new Error("标准输入中缺少 JSON 输入。");
  return JSON.parse(value) as unknown;
}

function sleep(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForPage(page: HeadlessPage) {
  const deadline = Date.now() + renderReadyTimeoutMs;
  while (Date.now() < deadline) {
    const state = await page.evaluate<{ status?: string; error?: string }>(headlessStatusExpression());
    if (state.status === "ready") return;
    if (state.status === "error") throw new Error(state.error ?? "无头渲染页面返回错误。");
    await sleep(renderPollIntervalMs);
  }
  throw new Error("等待无头分页渲染超时。");
}

function readPngMetadata(bytes: Buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(signature)) throw new Error("浏览器导出没有返回有效 PNG 数据。");
  return { height: bytes.readUInt32BE(20), width: bytes.readUInt32BE(16) };
}

async function writePages(pages: ExportedPage[], outputDir: string) {
  if (!pages.length) throw new Error("无头渲染未生成任何页面。");
  await mkdir(outputDir, { recursive: true });
  return Promise.all(pages.map(async (page, index) => {
    const relativePath = `page-${String(index + 1).padStart(3, "0")}.png`;
    const absolutePath = resolve(outputDir, relativePath);
    const bytes = Buffer.from(page.base64, "base64");
    const png = readPngMetadata(bytes);
    await writeFile(absolutePath, bytes);
    return { absolutePath, byteLength: bytes.length, height: png.height, index: index + 1, relativePath, width: png.width };
  }));
}

function exportExpression() {
  return "Promise.all(Array.from(document.querySelectorAll('.pages-wrapper > *')).map((_, index) => window.__ideacardExportPage(index)))";
}

async function render(input: ValidatedHeadlessInput, outputDir: string) {
  const pages = await withHeadlessPage(async (page) => {
    await page.setPayload(input);
    await page.goto(new URL("/headless", browserUrl).toString());
    await waitForPage(page);
    return page.evaluate<ExportedPage[]>(exportExpression());
  });
  const manifestPages = await writePages(pages, outputDir);
  const manifestPath = resolve(outputDir, "manifest.json");
  const manifest = {
    canvas: input.canvas,
    pageCount: manifestPages.length,
    pages: manifestPages,
    theme: input.theme,
    version: 1,
  };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  return { manifest, manifestPath };
}

function inputSummary(input: ValidatedHeadlessInput) {
  return {
    assetCount: Object.keys(input.assets).length,
    canvas: input.canvas,
    output: input.output,
    security: input.security,
    theme: input.theme,
  };
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const input = validateHeadlessInput(await readInput());
  if (options.command === "validate") return { input: inputSummary(input), ok: true, valid: true };
  const result = await render(input, options.outputDir as string);
  return { manifest: result.manifest, manifestPath: result.manifestPath, ok: true };
}

main().then(
  (result) => process.stdout.write(`${JSON.stringify(result)}\n`),
  (reason) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    process.stderr.write(`ideacard: ${message}\n`);
    process.stdout.write(`${JSON.stringify({ error: { message }, ok: false })}\n`);
    process.exitCode = 1;
  },
);
