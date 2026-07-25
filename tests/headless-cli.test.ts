import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { headlessStatusExpression } from "../lib/headless-status.ts";

const testUrl = process.env.IDEACARD_TEST_URL;

function evaluateHeadlessStatus(body: { dataset: Record<string, string | undefined> } | null) {
  return Function("document", `return ${headlessStatusExpression()};`)({ body }) as { status?: string; error?: string };
}

test("headless status probe treats a document without body as pending", () => {
  assert.deepEqual(evaluateHeadlessStatus(null), { error: undefined, status: undefined });
});

test("headless status probe preserves page error state", () => {
  assert.deepEqual(
    evaluateHeadlessStatus({ dataset: { ideacardError: "render failed", ideacardStatus: "error" } }),
    { error: "render failed", status: "error" },
  );
});

test("headless CLI validates input JSON from a file", async () => {
  const directory = await mkdtemp(resolve(tmpdir(), "ideacard-cli-input-test-"));
  const inputPath = resolve(directory, "card.json");
  try {
    await writeFile(inputPath, JSON.stringify({ markdown: "# 文件输入" }));
    const child = spawn(process.execPath, ["--import", "tsx", "scripts/ideacard.ts", "validate", "--input", inputPath], {
      cwd: process.cwd(),
    });
    let stdout = "";
    child.stdout.on("data", (chunk) => { stdout += String(chunk); });
    const code = await new Promise<number | null>((resolvePromise) => child.once("close", resolvePromise));
    assert.equal(code, 0);
    assert.deepEqual(JSON.parse(stdout), {
      input: {
        assetCount: 0,
        canvas: { height: 587, preset: "xiaohongshu", width: 440 },
        output: { pixelRatio: 2 },
        security: { allowHtml: false },
        social: {
          accentColor: "#171717",
          backgroundColor: "#fffdf7",
          fontPreset: "songti",
          fontScale: 1,
          fontScaleMode: "body",
          lineHeight: 1.22,
        },
        theme: "社交图文",
      },
      ok: true,
      valid: true,
    });
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

function runCli(input: Record<string, unknown>, outputDir: string) {
  return new Promise<{ stdout: string; stderr: string }>((resolvePromise, reject) => {
    const child = spawn(process.execPath, ["--import", "tsx", "scripts/ideacard.ts", "render", "--stdin", "--out", outputDir], {
      cwd: process.cwd(),
      env: { ...process.env, IDEACARD_URL: testUrl },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += String(chunk); });
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) resolvePromise({ stdout, stderr });
      else reject(new Error(`CLI 退出码 ${code}: ${stderr || stdout}`));
    });
    child.stdin.end(JSON.stringify(input));
  });
}

test("headless CLI renders continuous markdown into real PNG pages and manifest", { skip: !testUrl }, async () => {
  const outputDir = await mkdtemp(resolve(tmpdir(), "ideacard-cli-test-"));
  try {
    const markdown = await readFile(new URL("./fixtures/headless-continuous.md", import.meta.url), "utf8");
    const { stdout, stderr } = await runCli({ markdown }, outputDir);
    assert.equal(stderr, "");
    const result = JSON.parse(stdout) as { ok: boolean; manifest: { pageCount: number; pages: Array<{ absolutePath: string; relativePath: string; width: number; height: number; byteLength: number }> } };
    assert.equal(result.ok, true);
    assert.ok(result.manifest.pageCount >= 2);
    for (const page of result.manifest.pages) {
      assert.match(page.relativePath, /^page-\d{3}\.png$/);
      assert.equal(page.absolutePath, resolve(outputDir, page.relativePath));
      assert.ok(page.width >= 1080);
      assert.ok(page.height >= 1440);
      assert.ok(page.byteLength > 1024);
      const bytes = await readFile(page.absolutePath);
      assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    }
  } finally {
    await rm(outputDir, { force: true, recursive: true });
  }
});

test("headless CLI renders markdown with explicit image assets", { skip: !testUrl }, async () => {
  const outputDir = await mkdtemp(resolve(tmpdir(), "ideacard-cli-assets-test-"));
  const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLtwAAAAABJRU5ErkJggg==";
  try {
    const { stdout, stderr } = await runCli({
      markdown: "# 含图卡片\n\n![封面](asset://cover)",
      assets: { cover: { base64: png, mimeType: "image/png" } },
    }, outputDir);
    assert.equal(stderr, "");
    const result = JSON.parse(stdout) as { manifest: { pageCount: number; pages: Array<{ absolutePath: string }> }; ok: boolean };
    assert.equal(result.ok, true);
    assert.ok(result.manifest.pageCount >= 1);
    await access(result.manifest.pages[0].absolutePath);
  } finally {
    await rm(outputDir, { force: true, recursive: true });
  }
});
