import { access, mkdtemp, readdir, rm } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import { constants } from "node:fs";

const maxCdpExceptionLength = 4_000;
const maxCdpStackFrames = 5;

type CdpCallFrame = {
  columnNumber?: number;
  functionName?: string;
  lineNumber?: number;
  url?: string;
};

type CdpExceptionDetails = {
  exception?: { description?: string };
  stackTrace?: { callFrames?: CdpCallFrame[] };
  text?: string;
};

type CdpResult = { result?: { value?: unknown }; exceptionDetails?: CdpExceptionDetails };
type CdpMessage = { id?: number; result?: unknown; error?: { message?: string } };

const browserStartupTimeoutMs = 10_000;
const browserCloseTimeoutMs = 2_000;
const profileRemovalMaxRetries = 5;
const profileRemovalRetryDelayMs = 100;

function limitDiagnostic(value: string) {
  return value.length > maxCdpExceptionLength
    ? `${value.slice(0, maxCdpExceptionLength)}\n[diagnostic truncated]`
    : value;
}

function formatCdpCallFrame(frame: CdpCallFrame) {
  const location = frame.url
    ? `${frame.url}:${(frame.lineNumber ?? 0) + 1}:${(frame.columnNumber ?? 0) + 1}`
    : "unknown location";
  return `at ${frame.functionName || "<anonymous>"} (${location})`;
}

export function formatCdpException(details: CdpExceptionDetails) {
  const description = details.exception?.description;
  const summary = description || details.text || "页面脚本执行失败。";
  const frames = details.stackTrace?.callFrames?.slice(0, maxCdpStackFrames) ?? [];
  const stack = frames.map(formatCdpCallFrame);
  return limitDiagnostic([summary, ...stack].join("\n"));
}

function sleep(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

async function isExecutable(path: string) {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function findCachedChromium() {
  const cachePath = process.env.PLAYWRIGHT_BROWSERS_PATH ?? join(homedir(), ".cache", "ms-playwright");
  let entries;
  try {
    entries = await readdir(cachePath, { withFileTypes: true });
  } catch {
    return undefined;
  }
  const chromiumDirectories = entries
    .filter((entry) => entry.isDirectory() && /^chromium-\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => right.localeCompare(left, undefined, { numeric: true }));
  for (const directory of chromiumDirectories) {
    for (const relativePath of ["chrome-linux64/chrome", "chrome-linux/chrome"]) {
      const candidate = join(cachePath, directory, relativePath);
      if (await isExecutable(candidate)) return candidate;
    }
  }
  return undefined;
}

export async function resolveChromiumExecutable() {
  const configuredPath = process.env.IDEACARD_CHROMIUM_PATH;
  if (configuredPath) {
    if (await isExecutable(configuredPath)) return configuredPath;
    throw new Error("IDEACARD_CHROMIUM_PATH 不是可执行的 Chromium 文件。");
  }
  const cachedPath = await findCachedChromium();
  if (cachedPath) return cachedPath;
  throw new Error("未找到 Chromium；请设置 IDEACARD_CHROMIUM_PATH 指向本机 Chromium 可执行文件。");
}

class CdpClient {
  private nextId = 1;
  private pending = new Map<number, { resolve: (value: unknown) => void; reject: (reason: Error) => void }>();

  private constructor(private readonly socket: WebSocket) {
    socket.addEventListener("message", (event) => this.onMessage(String(event.data)));
    socket.addEventListener("close", () => this.rejectPending("Chromium CDP 连接已关闭。"));
    socket.addEventListener("error", () => this.rejectPending("Chromium CDP 连接失败。"));
  }

  static async connect(url: string) {
    const socket = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener("open", () => resolve(), { once: true });
      socket.addEventListener("error", () => reject(new Error("无法连接 Chromium CDP。")), { once: true });
    });
    return new CdpClient(socket);
  }

  call(method: string, params: Record<string, unknown> = {}, sessionId?: string) {
    const id = this.nextId;
    this.nextId += 1;
    this.socket.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise<unknown>((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  close() {
    this.socket.close();
  }

  private onMessage(value: string) {
    const message = JSON.parse(value) as CdpMessage;
    if (!message.id) return;
    const pending = this.pending.get(message.id);
    if (!pending) return;
    this.pending.delete(message.id);
    if (message.error) pending.reject(new Error(message.error.message ?? "Chromium CDP 请求失败。"));
    else pending.resolve(message.result);
  }

  private rejectPending(message: string) {
    for (const pending of this.pending.values()) pending.reject(new Error(message));
    this.pending.clear();
  }
}

async function getDebuggerUrl(browser: ChildProcess) {
  return new Promise<string>((resolve, reject) => {
    let stderr = "";
    const timeout = setTimeout(() => reject(new Error(`Chromium 启动超时。${stderr}`)), browserStartupTimeoutMs);
    const finish = (callback: () => void) => {
      clearTimeout(timeout);
      callback();
    };
    browser.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) finish(() => resolve(match[1]));
    });
    browser.once("error", (error) => finish(() => reject(error)));
    browser.once("exit", (code) => finish(() => reject(new Error(`Chromium 在启动时退出（${code ?? "未知"}）。${stderr}`))));
  });
}

async function waitForBrowserExit(browser: ChildProcess) {
  if (browser.exitCode !== null) return true;
  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => resolve(false), browserCloseTimeoutMs);
    browser.once("exit", () => {
      clearTimeout(timeout);
      resolve(true);
    });
  });
}

async function stopBrowser(browser: ChildProcess) {
  try {
    if (browser.exitCode !== null) return;
    browser.kill("SIGTERM");
    if (await waitForBrowserExit(browser)) return;
    browser.kill("SIGKILL");
    await waitForBrowserExit(browser);
  } catch {
    // Cleanup must preserve the callback's render failure when one exists.
  }
}

async function closeBrowser(client: CdpClient | undefined, browser: ChildProcess) {
  if (client) {
    try {
      await Promise.race([client.call("Browser.close"), sleep(browserCloseTimeoutMs)]);
    } catch {
      // Chromium may close the CDP socket before acknowledging Browser.close.
    }
    client.close();
  }
  if (await waitForBrowserExit(browser)) return;
  await stopBrowser(browser);
}

export async function cleanupChromiumProfile(profileDirectory: string) {
  try {
    await rm(profileDirectory, {
      force: true,
      maxRetries: profileRemovalMaxRetries,
      recursive: true,
      retryDelay: profileRemovalRetryDelayMs,
    });
  } catch {
    // Profile cleanup is best effort and must not replace a render result or error.
  }
}

export class HeadlessPage {
  constructor(private readonly client: CdpClient, private readonly sessionId: string) {}

  async setPayload(payload: unknown) {
    const source = `window.name = ${JSON.stringify(JSON.stringify(payload))};`;
    await this.client.call("Page.addScriptToEvaluateOnNewDocument", { source }, this.sessionId);
  }

  async goto(url: string) {
    await this.client.call("Page.navigate", { url }, this.sessionId);
  }

  async evaluate<T>(expression: string) {
    const response = await this.client.call("Runtime.evaluate", {
      awaitPromise: true,
      expression,
      returnByValue: true,
    }, this.sessionId) as CdpResult;
    if (response.exceptionDetails) throw new Error(formatCdpException(response.exceptionDetails));
    return response.result?.value as T;
  }
}

async function createPage(client: CdpClient) {
  const target = await client.call("Target.createTarget", { url: "about:blank" }) as { targetId: string };
  const attached = await client.call("Target.attachToTarget", { flatten: true, targetId: target.targetId }) as { sessionId: string };
  await client.call("Page.enable", {}, attached.sessionId);
  await client.call("Emulation.setDeviceMetricsOverride", {
    deviceScaleFactor: 1,
    height: 1200,
    mobile: false,
    width: 1440,
  }, attached.sessionId);
  return new HeadlessPage(client, attached.sessionId);
}

export async function withHeadlessPage<T>(callback: (page: HeadlessPage) => Promise<T>) {
  const executable = await resolveChromiumExecutable();
  const profileDirectory = await mkdtemp(join(tmpdir(), "ideacard-chromium-"));
  const browser = spawn(executable, [
    "--headless=new",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-sandbox",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDirectory}`,
    "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let client: CdpClient | undefined;
  try {
    client = await CdpClient.connect(await getDebuggerUrl(browser));
    return await callback(await createPage(client));
  } finally {
    await closeBrowser(client, browser);
    await cleanupChromiumProfile(profileDirectory);
  }
}
