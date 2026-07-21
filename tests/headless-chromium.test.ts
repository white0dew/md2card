import assert from "node:assert/strict";
import { access, mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { cleanupChromiumProfile, formatCdpException } from "@/lib/headless-chromium";

test("CDP evaluation diagnostics retain the exception description and call site", () => {
  const message = formatCdpException({
    exception: {
      description: "TypeError: Cannot read properties of undefined (reading 'cloneNode')",
    },
    stackTrace: {
      callFrames: [{ columnNumber: 4, functionName: "toSvg", lineNumber: 81, url: "http://127.0.0.1:3000/_next/static/chunk.js" }],
    },
    text: "Uncaught",
  });

  assert.match(message, /TypeError: Cannot read properties/);
  assert.match(message, /toSvg \(http:\/\/127\.0\.0\.1:3000\/_next\/static\/chunk\.js:82:5\)/);
});

test("Chromium profile cleanup recursively removes a populated profile", async () => {
  const profileDirectory = await mkdtemp(join(tmpdir(), "ideacard-profile-cleanup-"));
  await mkdir(join(profileDirectory, "Default", "Cache"), { recursive: true });
  await writeFile(join(profileDirectory, "Default", "Cache", "state"), "pending");

  await cleanupChromiumProfile(profileDirectory);

  await assert.rejects(access(profileDirectory));
});
