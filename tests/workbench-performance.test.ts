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
