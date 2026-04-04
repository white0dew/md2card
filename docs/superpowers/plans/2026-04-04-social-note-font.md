# Social Note Font Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `社交图文` 主题增加字体风格切换，并将默认正文基础字号从 `16px` 调整为 `17px`。

**Architecture:** 新增一个集中式社交图文字体预设模块，供 `settings-store`、设置侧栏和 `SocialNoteCard` 复用；由 Zustand persist 持久化字体预设选择；卡片组件通过 CSS 变量接入字体栈，并保留现有颜色和分页逻辑不变。

**Tech Stack:** Next.js App Router、React 19、TypeScript、Zustand persist、styled-components、node:test、agent-browser

---

### Task 1: 先写失败测试锁定需求

**Files:**
- Modify: `tests/social-note-theme.test.ts`

- [ ] **Step 1: 为字体配置和字号调整补测试**
  - 追加断言，要求 `settings-store` 暴露 `socialFontPreset` 与 `setSocialFontPreset`
  - 追加断言，要求 `SettingsSidebar` 暴露“字体风格”入口
  - 追加断言，要求 `SocialNoteCard` 读取 `socialFontPreset` 并把正文基础字号设为 `17px`

- [ ] **Step 2: 运行目标测试并确认红灯**
  - Run: `pnpm test tests/social-note-theme.test.ts`
  - Expected: FAIL，且失败点指向新增字体字段、侧栏入口或字号断言尚未满足

### Task 2: 增加字体预设模块和持久化状态

**Files:**
- Create: `lib/social-note-fonts.ts`
- Modify: `stores/settings-store.ts`

- [ ] **Step 1: 新增字体预设模块**
  - 定义 `SocialNoteFontOption`
  - 导出 `socialNoteFontOptions`
  - 导出 `defaultSocialNoteFontPreset`
  - 导出 `resolveSocialNoteFontPreset`
  - 首版预设值固定为 `songti`、`heiti`、`rounded`

- [ ] **Step 2: 扩展 settings store**
  - 新增 `socialFontPreset` 状态字段
  - 新增 `setSocialFontPreset` setter
  - 在 `createDefaultSettingsState()` 中补默认值
  - 在 `migrate` 中对旧缓存做兜底校验
  - 持久化版本号递增

- [ ] **Step 3: 运行目标测试，验证数据层已补齐**
  - Run: `pnpm test tests/social-note-theme.test.ts`
  - Expected: 仍可能 FAIL，但应只剩 UI 或卡片样式相关断言

### Task 3: 在社交图文设置区加入字体风格选择

**Files:**
- Modify: `components/workbench/settings-sidebar.tsx`

- [ ] **Step 1: 引入字体预设配置与 store setter**
  - 从 `lib/social-note-fonts.ts` 读取选项
  - 从 `useSettingsStore()` 读取 `socialFontPreset` 与 `setSocialFontPreset`

- [ ] **Step 2: 增加“字体风格”选择器**
  - 放在 `社交图文` 设置区，靠近颜色配置
  - 使用现有 `select` 表单样式，避免引入额外复杂交互

- [ ] **Step 3: 运行目标测试，验证侧栏入口已接通**
  - Run: `pnpm test tests/social-note-theme.test.ts`
  - Expected: 仍可能 FAIL，但应只剩卡片字体应用或字号断言

### Task 4: 将字体预设接入社交图文卡片

**Files:**
- Modify: `components/cards/SocialNoteCard.tsx`
- Modify: `lib/social-note-fonts.ts`

- [ ] **Step 1: 在字体预设模块中补字体栈映射**
  - `songti` -> `"Songti SC", "STSong", "Noto Serif SC", serif`
  - `heiti` -> `"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif`
  - `rounded` -> `"Hiragino Maru Gothic ProN", "SF Pro Rounded", "Arial Rounded MT Bold", "Noto Sans SC", sans-serif`

- [ ] **Step 2: 让 `SocialNoteCard` 读取并应用字体配置**
  - 通过 `useSettingsStore` 读取 `socialFontPreset`
  - 用 CSS 变量或内联 style 将字体栈注入卡片容器
  - 将 `.card-content` 基础字号从 `16px` 调整为 `17px`

- [ ] **Step 3: 运行目标测试，验证绿灯**
  - Run: `pnpm test tests/social-note-theme.test.ts`
  - Expected: PASS

### Task 5: 完整回归与真实导出验收

**Files:**
- Modify: `tmp-downloads/` 下的临时校验产物（无需提交）

- [ ] **Step 1: 运行完整测试**
  - Run: `pnpm test`
  - Expected: PASS

- [ ] **Step 2: 运行 lint**
  - Run: `pnpm lint`
  - Expected: PASS

- [ ] **Step 3: 运行生产构建**
  - Run: `pnpm build`
  - Expected: PASS

- [ ] **Step 4: 执行真实浏览器导出校验**
  - Run: `pnpm verify:export --theme 社交图文 --url http://127.0.0.1:3000/ --session social-note-font-verify --output-dir tmp-downloads/social-note-font-export`
  - Expected: 成功导出 PNG，并输出与左侧 Markdown 对照的校验结果
