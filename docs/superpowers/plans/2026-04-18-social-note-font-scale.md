# Social Note Font Scale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `社交图文` 主题新增可持久化的字号缩放参数，支持“仅正文”和“整体”两种作用范围。

**Architecture:** 沿用现有 `settings-store -> settings-sidebar -> SocialNoteCard` 的社交图文配置链路。新增两个轻量状态字段和对应 clamp/resolve 工具，再由 `SocialNoteCard` 通过 CSS 变量和 `calc()` 接入字号缩放，最后用 Node 测试与真实浏览器导出双重验证。

**Tech Stack:** Next.js App Router, React, TypeScript, Zustand, styled-components, node:test, agent-browser

---

## File Map

- Modify: `tests/social-note-theme.test.ts`
  - 追加社交图文字号缩放相关断言，先让测试失败。
- Modify: `stores/settings-store.ts`
  - 新增 `socialFontScaleMode` / `socialFontScale` 状态、setter、clamp 与 migrate 修正。
- Modify: `components/workbench/settings-sidebar.tsx`
  - 在社交图文设置区增加作用范围选择器、字号倍数滑杆和文本标签。
- Modify: `components/cards/SocialNoteCard.tsx`
  - 读取新状态，提取字号常量，并按模式输出 CSS 变量与 `calc()` 缩放规则。

### Task 1: 为字号缩放补失败测试

**Files:**
- Modify: `tests/social-note-theme.test.ts`

- [ ] **Step 1: 写失败测试，要求 store 暴露字号缩放字段和 setter**

```ts
test("settings store persists social-note font scale settings", async () => {
  const storeText = await readFile(
    new URL("../stores/settings-store.ts", import.meta.url),
    "utf8",
  );

  assert.match(storeText, /socialFontScaleMode/);
  assert.match(storeText, /socialFontScale/);
  assert.match(storeText, /setSocialFontScaleMode/);
  assert.match(storeText, /setSocialFontScale/);
});
```

- [ ] **Step 2: 写失败测试，要求侧栏暴露字号缩放控件**

```ts
test("settings sidebar exposes social-note font scale controls", async () => {
  const sidebarText = await readFile(
    new URL("../components/workbench/settings-sidebar.tsx", import.meta.url),
    "utf8",
  );

  assert.match(sidebarText, /字号缩放/);
  assert.match(sidebarText, /social-font-scale-mode/);
  assert.match(sidebarText, /social-font-scale/);
});
```

- [ ] **Step 3: 写失败测试，要求卡片读取缩放模式并输出缩放变量**

```ts
test("social-note theme reads font scale mode and outputs scale variables", async () => {
  const cardText = await readFile(
    new URL("../components/cards/SocialNoteCard.tsx", import.meta.url),
    "utf8",
  );

  assert.match(cardText, /socialFontScaleMode/);
  assert.match(cardText, /socialFontScale/);
  assert.match(cardText, /--social-font-scale/);
  assert.match(cardText, /--social-body-font-size/);
  assert.match(cardText, /calc\(/);
});
```

- [ ] **Step 4: 跑测试确认红灯**

Run: `pnpm test tests/social-note-theme.test.ts`
Expected: FAIL，且失败点指向新增字号缩放字段、侧栏控件或卡片缩放规则尚未存在。

### Task 2: 在 store 中加入字号缩放状态

**Files:**
- Modify: `stores/settings-store.ts`
- Test: `tests/social-note-theme.test.ts`

- [ ] **Step 1: 增加字号缩放类型、默认值和 setter**

```ts
export type SocialFontScaleMode = "body" | "all";

interface SettingsState {
  socialFontScaleMode: SocialFontScaleMode;
  socialFontScale: number;
  setSocialFontScaleMode: (mode: SocialFontScaleMode) => void;
  setSocialFontScale: (scale: number) => void;
}
```

- [ ] **Step 2: 增加 clamp / resolve，保证非法值回退**

```ts
const minSocialFontScale = 0.85;
const maxSocialFontScale = 1.3;
const defaultSocialFontScale = 1;

function clampSocialFontScale(scale: number) {
  return Math.min(maxSocialFontScale, Math.max(minSocialFontScale, scale));
}

function resolveSocialFontScaleMode(
  mode: SocialFontScaleMode | string | null | undefined,
): SocialFontScaleMode {
  return mode === "all" ? "all" : "body";
}
```

- [ ] **Step 3: 将默认值和 migrate 接入 persist**

```ts
socialFontScaleMode: "body",
socialFontScale: defaultSocialFontScale,
```

```ts
socialFontScaleMode: resolveSocialFontScaleMode(state.socialFontScaleMode),
socialFontScale: clampSocialFontScale(
  typeof state.socialFontScale === "number" ? state.socialFontScale : defaultSocialFontScale,
),
```

- [ ] **Step 4: 跑测试确认 store 断言转绿**

Run: `pnpm test tests/social-note-theme.test.ts`
Expected: 仍可能 FAIL，但 store 相关失败应消失。

### Task 3: 在侧栏加入字号缩放控件

**Files:**
- Modify: `components/workbench/settings-sidebar.tsx`
- Test: `tests/social-note-theme.test.ts`

- [ ] **Step 1: 从 store 读取新字段和 setter**

```ts
socialFontScaleMode,
socialFontScale,
setSocialFontScaleMode,
setSocialFontScale,
```

- [ ] **Step 2: 增加作用范围选择器和倍数滑杆**

```tsx
<label className="mb-2 block text-sm text-slate-600" htmlFor="social-font-scale-mode">
  字号缩放
</label>
<select
  id="social-font-scale-mode"
  value={socialFontScaleMode}
  onChange={(event) => setSocialFontScaleMode(event.target.value as "body" | "all")}
>
  <option value="body">仅正文</option>
  <option value="all">整体</option>
</select>
<input
  id="social-font-scale"
  min={0.85}
  max={1.3}
  step={0.05}
  type="range"
  value={socialFontScale}
  onChange={(event) => setSocialFontScale(Number(event.target.value))}
/>
```

- [ ] **Step 3: 增加倍数字符串展示，避免用户盲调**

```tsx
<p className="text-xs text-slate-500">{socialFontScale.toFixed(2)}x</p>
```

- [ ] **Step 4: 跑测试确认侧栏断言转绿**

Run: `pnpm test tests/social-note-theme.test.ts`
Expected: 仍可能 FAIL，但侧栏相关失败应消失。

### Task 4: 将字号缩放接入社交图文卡片

**Files:**
- Modify: `components/cards/SocialNoteCard.tsx`
- Test: `tests/social-note-theme.test.ts`

- [ ] **Step 1: 提取字号常量，替换散落的 magic numbers**

```ts
const BASE_BODY_FONT_SIZE = 17;
const BASE_TIME_FONT_SIZE = 14;
const BASE_SOCIAL_TITLE_FONT_SIZE = 31;
const BASE_H1_FONT_SIZE = 27;
const BASE_H2_FONT_SIZE = 23;
```

- [ ] **Step 2: 读取 store 字段并注入 CSS 变量**

```ts
const socialFontScaleMode = useSettingsStore((state) => state.socialFontScaleMode);
const socialFontScale = useSettingsStore((state) => state.socialFontScale);

const cardStyle = {
  ["--social-font-scale" as string]: String(socialFontScale),
  ["--social-body-font-size" as string]:
    socialFontScaleMode === "body"
      ? `calc(${BASE_BODY_FONT_SIZE}px * var(--social-font-scale))`
      : `${BASE_BODY_FONT_SIZE}px`,
} as CSSProperties;
```

- [ ] **Step 3: 用 `calc()` 区分 body 模式和 all 模式**

```ts
const resolveScaledFontSize = (baseSize: number) =>
  `calc(${baseSize}px * var(--social-font-scale, 1))`;
```

```css
.card-content {
  font-size: var(--social-body-font-size, 17px);
}

.social-title {
  font-size: calc(31px * var(--social-title-scale, 1));
}
```

- [ ] **Step 4: 在 `body` 模式下让标题缩放变量保持 `1`，在 `all` 模式下等于倍数**

```ts
["--social-title-scale" as string]:
  socialFontScaleMode === "all" ? String(socialFontScale) : "1",
```

- [ ] **Step 5: 跑测试确认绿灯**

Run: `pnpm test tests/social-note-theme.test.ts`
Expected: PASS

### Task 5: 完整验证与真实导出

**Files:**
- Modify: `tests/social-note-theme.test.ts`（如实现中需微调断言）
- Verify: 浏览器导出产物到 `tmp-downloads/`

- [ ] **Step 1: 运行相关自动化测试**

Run: `pnpm test tests/social-note-theme.test.ts tests/social-note-typography.test.ts`
Expected: PASS

- [ ] **Step 2: 使用浏览器打开本地页面，切到社交图文并分别验证 `body` / `all` 两种模式**

```text
URL: http://localhost:3000/
Theme: 社交图文
Scale cases:
- body / 1.15x
- all / 1.15x
```

- [ ] **Step 3: 实际导出 PNG，并逐项对照 Markdown 与图片**

Checklist:
- 文字无缺失
- 文字无截断
- 段落未丢失
- 分页后内容连续

- [ ] **Step 4: 汇总验证结果，不在缺少 PNG 对照证据时声称完成**
