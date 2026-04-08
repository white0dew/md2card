import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("workbench subscribes only to the preset slice it needs", async () => {
  const source = await readFile(
    new URL("../components/workbench/workbench.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /useSettingsStore\(\(state\) => state\.selectedPreset\)/);
  assert.doesNotMatch(source, /const \{ selectedPreset \} = useSettingsStore\(\);/);
});

test("workbench keeps the top bar sticky and budgets the main viewport height", async () => {
  const [workbenchSource, topBarSource] = await Promise.all([
    readFile(
      new URL("../components/workbench/workbench.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../components/workbench/top-bar.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(topBarSource, /sticky top-0/);
  assert.match(topBarSource, /z-30/);
  assert.match(workbenchSource, /xl:h-screen/);
  assert.match(workbenchSource, /xl:overflow-hidden/);
  assert.match(workbenchSource, /xl:h-\[calc\(100vh-72px\)\]/);
  assert.match(workbenchSource, /xl:items-stretch/);
  assert.match(workbenchSource, /xl:min-h-0/);
});
