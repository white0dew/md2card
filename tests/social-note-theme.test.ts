import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("social-note theme only shows the lead meta block on the first page", async () => {
  const cardText = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );

  assert.match(cardText, /pageIndex\s*===\s*0/);
  assert.match(cardText, /showLeadMeta/);
});

test("card props expose pageIndex for paginated themes", async () => {
  const typesText = await readFile(new URL("../lib/card-types.ts", import.meta.url), "utf8");
  assert.match(typesText, /pageIndex\?:\s*number/);
});

test("social-note theme reads profile content from shared social profile config", async () => {
  const cardText = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );

  assert.match(cardText, /useSettingsStore/);
  assert.match(cardText, /resolveSocialProfile/);
});

test("social-note theme reads background and accent colors from settings", async () => {
  const cardText = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );

  assert.match(cardText, /socialBackgroundColor/);
  assert.match(cardText, /socialAccentColor/);
});

test("settings sidebar supports avatar upload flow", async () => {
  const sidebarText = await readFile(
    new URL("../components/workbench/settings-sidebar.tsx", import.meta.url),
    "utf8",
  );

  assert.match(sidebarText, /FileReader/);
  assert.match(sidebarText, /readAsDataURL/);
  assert.match(sidebarText, /type="file"/);
  assert.match(sidebarText, /setSocialProfileAvatarUrl\(dataUrl\)/);
});

test("settings sidebar exposes social-note color palette controls", async () => {
  const sidebarText = await readFile(
    new URL("../components/workbench/settings-sidebar.tsx", import.meta.url),
    "utf8",
  );

  assert.match(sidebarText, /背景颜色/);
  assert.match(sidebarText, /重点字体颜色/);
  assert.match(sidebarText, /setSocialBackgroundColor/);
  assert.match(sidebarText, /setSocialAccentColor/);
});

test("settings store persists social-note color selections", async () => {
  const storeText = await readFile(
    new URL("../stores/settings-store.ts", import.meta.url),
    "utf8",
  );

  assert.match(storeText, /socialBackgroundColor/);
  assert.match(storeText, /socialAccentColor/);
  assert.match(storeText, /setSocialBackgroundColor/);
  assert.match(storeText, /setSocialAccentColor/);
});
