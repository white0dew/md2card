import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const skillUrl = new URL("../.agents/skills/ideacard/SKILL.md", import.meta.url);

test("ideacard agent skill documents the headless CLI operating contract", async () => {
  const skill = await readFile(skillUrl, "utf8");

  assert.match(skill, /^---\nname: ideacard\n/);
  for (const contract of [
    "IDEACARD_URL",
    "validate --stdin",
    "render --stdin --out",
    "asset://<id>",
    "manifest.json",
  ]) {
    assert.ok(skill.includes(contract), `skill must document ${contract}`);
  }
});

test("ideacard agent skill examples invoke pnpm subcommands directly", async () => {
  const skill = await readFile(skillUrl, "utf8");

  for (const command of [
    "pnpm run ideacard validate --stdin",
    'pnpm run ideacard render --stdin --out "$PWD/artifacts/first-card"',
  ]) {
    assert.ok(skill.includes(command), `skill must document ${command}`);
  }
  assert.ok(
    !skill.includes("pnpm run ideacard -- "),
    "skill examples must not insert -- before the ideacard subcommand",
  );
});
