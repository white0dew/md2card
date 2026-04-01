#!/usr/bin/env tsx

import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  extractExportButtonRef,
  findMissingLines,
} from "@/lib/export-verification";
import { resolveSocialProfile } from "@/lib/social-profile";

interface CliOptions {
  markdown: string;
  url: string;
  outputDir: string;
  sessionName: string;
  preset: string;
  theme: string;
  viewMode: string;
  width: number;
  height: number;
  profileName: string;
  profileTime: string;
  profileAvatar: string;
}

interface VerificationReport {
  markdownPath: string;
  zipPath: string | null;
  downloadPath: string;
  screenshotPath: string;
  imagePaths: string[];
  expectedPages: string[];
  actualPages: string[];
  missingByPage: Array<{ page: number; missingLines: string[] }>;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    markdown: "",
    url: "http://127.0.0.1:3000/",
    outputDir: resolve("tmp-downloads/export-verify"),
    sessionName: "md2card-export-verify",
    preset: "xiaohongshu",
    theme: "社交图文",
    viewMode: "短卡片",
    width: 440,
    height: 587,
    profileName: "",
    profileTime: "",
    profileAvatar: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    switch (token) {
      case "--markdown":
        options.markdown = next;
        index += 1;
        break;
      case "--url":
        options.url = next;
        index += 1;
        break;
      case "--output-dir":
        options.outputDir = resolve(next);
        index += 1;
        break;
      case "--session":
        options.sessionName = next;
        index += 1;
        break;
      case "--preset":
        options.preset = next;
        index += 1;
        break;
      case "--theme":
        options.theme = next;
        index += 1;
        break;
      case "--view-mode":
        options.viewMode = next;
        index += 1;
        break;
      case "--width":
        options.width = Number.parseInt(next, 10);
        index += 1;
        break;
      case "--height":
        options.height = Number.parseInt(next, 10);
        index += 1;
        break;
      case "--profile-name":
        options.profileName = next;
        index += 1;
        break;
      case "--profile-time":
        options.profileTime = next;
        index += 1;
        break;
      case "--profile-avatar":
        options.profileAvatar = next;
        index += 1;
        break;
      default:
        break;
    }
  }

  if (!options.markdown) {
    throw new Error("缺少 `--markdown <path>` 参数。");
  }

  return options;
}

function run(command: string, args: string[]) {
  return execFileSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function runAgent(sessionName: string, args: string[]) {
  return run("agent-browser", ["--session-name", sessionName, ...args]);
}

function parseAgentStringOutput<T>(value: string) {
  return JSON.parse(JSON.parse(value)) as T;
}

async function sleep(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function listPngs(directory: string) {
  const entries = await readdir(directory);
  const pngPaths = await Promise.all(
    entries
      .filter((entry) => entry.endsWith(".png"))
      .sort((left, right) => left.localeCompare(right, "en"))
      .map(async (entry) => {
        const absolutePath = resolve(directory, entry);
        const metadata = await stat(absolutePath);
        return metadata.isFile() ? absolutePath : null;
      }),
  );

  return pngPaths.filter((path): path is string => Boolean(path));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const markdownPath = resolve(options.markdown);
  const markdown = await readFile(markdownPath, "utf8");
  const profile = resolveSocialProfile({
    avatarUrl: options.profileAvatar,
    name: options.profileName,
    timeLabel: options.profileTime,
  });

  const outputDir = options.outputDir;
  const downloadsDir = resolve(outputDir, "downloads");
  const unzipDir = resolve(outputDir, "unzip");
  const screenshotPath = resolve(outputDir, "preview.png");
  const reportPath = resolve(outputDir, "report.json");
  const expectedTextPath = resolve(outputDir, "expected-pages.json");
  const actualTextPath = resolve(outputDir, "ocr-pages.json");
  const markdownCopyPath = resolve(outputDir, "source.md");

  await mkdir(downloadsDir, { recursive: true });
  await mkdir(unzipDir, { recursive: true });
  await writeFile(markdownCopyPath, markdown, "utf8");

  const settingsState = {
    state: {
      cardWidth: options.width,
      cardHeight: options.height,
      selectedPreset: options.preset,
      viewMode: options.viewMode,
      hideOverflow: false,
      selectedTheme: options.theme,
      socialProfileName: profile.name,
      socialProfileTimeLabel: profile.timeLabel,
      socialProfileAvatarUrl: profile.avatarUrl,
    },
    version: 3,
  };

  const editorState = {
    state: {
      content: markdown,
    },
    version: 1,
  };

  const bootstrapScript = `
    localStorage.setItem("editor-storage", JSON.stringify(${JSON.stringify(editorState)}));
    localStorage.setItem("settings-storage", JSON.stringify(${JSON.stringify(settingsState)}));
    "ok";
  `;

  runAgent(options.sessionName, ["open", options.url]);
  runAgent(options.sessionName, ["wait", "2000"]);
  runAgent(options.sessionName, ["eval", bootstrapScript]);
  runAgent(options.sessionName, ["reload"]);
  runAgent(options.sessionName, ["wait", "3500"]);
  runAgent(options.sessionName, ["screenshot", screenshotPath]);

  const expectedPages = parseAgentStringOutput<string[]>(
    runAgent(
      options.sessionName,
      [
        "eval",
        `JSON.stringify(Array.from(document.querySelectorAll("#preview article")).map((article) => article.innerText))`,
      ],
    ),
  );

  const snapshot = runAgent(options.sessionName, ["snapshot", "-i"]);
  const exportRef = extractExportButtonRef(snapshot);

  if (!exportRef) {
    throw new Error("未在页面上找到导出按钮引用。");
  }

  runAgent(
    options.sessionName,
    [
      "eval",
      `
        (() => {
          const globalState = window;
          globalState.__md2cardBlobMap = {};
          globalState.__md2cardCapturedDownloads = [];

          if (!globalState.__md2cardDownloadHookInstalled) {
            globalState.__md2cardDownloadHookInstalled = true;

            const originalCreateObjectURL = URL.createObjectURL.bind(URL);
            URL.createObjectURL = (blob) => {
              const objectUrl = originalCreateObjectURL(blob);
              globalState.__md2cardBlobMap[objectUrl] = blob;
              return objectUrl;
            };

            const originalClick = HTMLAnchorElement.prototype.click;
            HTMLAnchorElement.prototype.click = function clickPatched() {
              if (this.download && this.href && globalState.__md2cardBlobMap[this.href]) {
                globalState.__md2cardCapturedDownloads.push({
                  fileName: this.download,
                  href: this.href,
                });
              }

              return originalClick.apply(this);
            };
          }

          "ok";
        })()
      `,
    ],
  );
  runAgent(
    options.sessionName,
    [
      "eval",
      `
        (() => {
          const exportButton = Array.from(document.querySelectorAll("button")).find((button) =>
            button.textContent?.includes("导出 PNG / ZIP"),
          );

          if (!exportButton) {
            throw new Error("未找到导出按钮。");
          }

          exportButton.click();
          "ok";
        })()
      `,
    ],
  );

  let captureReady = false;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await sleep(500);
    const ready = parseAgentStringOutput<boolean>(
      runAgent(
        options.sessionName,
        [
          "eval",
          `JSON.stringify(Boolean(window.__md2cardCapturedDownloads && window.__md2cardCapturedDownloads.length > 0))`,
        ],
      ),
    );

    if (ready) {
      captureReady = true;
      break;
    }
  }

  if (!captureReady) {
    throw new Error("导出按钮已点击，但未捕获到导出文件。");
  }

  const capturedDownloads = parseAgentStringOutput<Array<{ fileName: string; base64: string }>>(
    runAgent(
      options.sessionName,
      [
        "eval",
        `
          (async () => JSON.stringify(await Promise.all(
            window.__md2cardCapturedDownloads.map(async (item) => {
              const blob = window.__md2cardBlobMap[item.href];
              const bytes = new Uint8Array(await blob.arrayBuffer());
              let binary = "";
              const chunkSize = 32768;

              for (let index = 0; index < bytes.length; index += chunkSize) {
                binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
              }

              return {
                fileName: item.fileName,
                base64: btoa(binary),
              };
            }),
          )))()
        `,
      ],
    ),
  );

  if (capturedDownloads.length === 0) {
    throw new Error("导出流程未返回任何文件。");
  }

  const exportedFile = capturedDownloads[0];
  const downloadPath = resolve(downloadsDir, exportedFile.fileName);
  await writeFile(downloadPath, Buffer.from(exportedFile.base64, "base64"));

  let imagePaths: string[] = [];
  let zipPath: string | null = null;
  if (downloadPath.endsWith(".zip")) {
    zipPath = downloadPath;
    run("unzip", ["-o", zipPath, "-d", unzipDir]);
    imagePaths = await listPngs(unzipDir);
  } else {
    imagePaths = [downloadPath];
  }

  const actualPages = imagePaths.map((imagePath) =>
    run("swift", ["scripts/ocr-image.swift", imagePath]),
  );

  const missingByPage = expectedPages.map((expectedPage, index) => ({
    page: index + 1,
    missingLines: findMissingLines(expectedPage, actualPages[index] ?? ""),
  }));

  const report: VerificationReport = {
    markdownPath,
    zipPath,
    downloadPath,
    screenshotPath,
    imagePaths,
    expectedPages,
    actualPages,
    missingByPage,
  };

  await writeFile(expectedTextPath, JSON.stringify(expectedPages, null, 2), "utf8");
  await writeFile(actualTextPath, JSON.stringify(actualPages, null, 2), "utf8");
  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  const pageCountMismatch = expectedPages.length !== actualPages.length;
  const pagesWithMissing = missingByPage.filter((page) => page.missingLines.length > 0);

  console.log(`Markdown: ${markdownPath}`);
  console.log(`截图: ${screenshotPath}`);
  if (zipPath) {
    console.log(`ZIP: ${zipPath}`);
  }
  imagePaths.forEach((imagePath, index) => {
    console.log(`PNG ${index + 1}: ${imagePath}`);
  });
  console.log(`报告: ${reportPath}`);

  if (pageCountMismatch) {
    console.error(
      `页数不一致：预览 ${expectedPages.length} 页，OCR 导出 ${actualPages.length} 页。`,
    );
    process.exit(1);
  }

  if (pagesWithMissing.length > 0) {
    pagesWithMissing.forEach((page) => {
      console.error(`第 ${page.page} 张缺失内容:`);
      page.missingLines.forEach((line) => console.error(`- ${line}`));
    });
    process.exit(1);
  }

  console.log("导出验证通过：未发现缺字或断段。");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
