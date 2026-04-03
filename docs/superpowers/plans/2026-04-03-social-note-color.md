# Social Note Color Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `社交图文` 主题增加背景颜色和重点字体颜色的预设调色板配置，并将配置持久化到本地。

**Architecture:** 在 `stores/settings-store.ts` 中扩展社交图文主题状态；新增一个集中式颜色预设模块供侧栏和卡片复用；由 `components/workbench/settings-sidebar.tsx` 渲染色块选择器，并由 `components/cards/SocialNoteCard.tsx` 消费配置渲染最终样式。

**Tech Stack:** Next.js App Router、React 19、TypeScript、Zustand persist、styled-components、node:test

---

### Task 1: 写失败测试

**Files:**
- Modify: `tests/social-note-theme.test.ts`
- Modify: `tests/social-profile.test.ts`

- [ ] **Step 1: 为社交图文颜色配置补失败断言**
- [ ] **Step 2: 运行目标测试并确认失败**

### Task 2: 增加颜色预设与持久化字段

**Files:**
- Create: `lib/social-note-colors.ts`
- Modify: `stores/settings-store.ts`

- [ ] **Step 1: 新增社交图文调色板定义与默认值**
- [ ] **Step 2: 扩展 settings store 字段、setter、默认值与 migrate**
- [ ] **Step 3: 运行目标测试并修正实现**

### Task 3: 增加设置面板调色板 UI

**Files:**
- Modify: `components/workbench/settings-sidebar.tsx`

- [ ] **Step 1: 在社交图文设置区加入背景色与重点色选择器**
- [ ] **Step 2: 增加选中态和可读标签**
- [ ] **Step 3: 运行目标测试并修正实现**

### Task 4: 将颜色配置接入社交图文卡片

**Files:**
- Modify: `components/cards/SocialNoteCard.tsx`

- [ ] **Step 1: 读取 store 中的背景色和重点色**
- [ ] **Step 2: 把颜色接入 styled-components 样式**
- [ ] **Step 3: 运行目标测试并修正实现**

### Task 5: 回归验证

**Files:**
- Modify: `tests/social-note-theme.test.ts`

- [ ] **Step 1: 运行 `pnpm test`**
- [ ] **Step 2: 运行目标 `eslint`**
- [ ] **Step 3: 运行 `pnpm build`**
- [ ] **Step 4: 使用浏览器执行真实导出校验**
