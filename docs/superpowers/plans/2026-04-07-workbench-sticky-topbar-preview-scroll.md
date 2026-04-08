# MD2Card Sticky Top Bar And Preview Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the workbench so the top bar stays fixed during page scroll and the preview pane exposes an internal vertical scrollbar.

**Architecture:** Keep export/rendering behavior unchanged and limit the work to layout containers. The top bar handles sticky positioning, the workbench main area budgets viewport height against the top bar, and the preview pane owns the internal scroll container.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Node test runner.

---

### Task 1: Lock the desired layout behavior in source-level tests

**Files:**
- Modify: `tests/workbench-performance.test.ts`
- Modify: `tests/preview-performance.test.ts`

- [ ] Write a failing test asserting `TopBar` includes sticky top positioning and `Workbench` uses a main height budget tied to the header height.
- [ ] Run `pnpm test -- --test-name-pattern "workbench"` and confirm failure matches the missing sticky/layout behavior.
- [ ] Write a failing test asserting `PreviewPane` exposes an internal vertical scroll container and preserves scrollbar visibility classes.
- [ ] Run `pnpm test -- --test-name-pattern "preview pane"` and confirm failure matches the missing preview scroll behavior.

### Task 2: Implement the sticky top bar and preview scroll behavior

**Files:**
- Modify: `components/workbench/top-bar.tsx`
- Modify: `components/workbench/workbench.tsx`
- Modify: `components/workbench/preview-pane.tsx`

- [ ] Add sticky top positioning and z-index to `TopBar`.
- [ ] Budget the workbench main area with a viewport-height calculation that subtracts the top bar height on desktop.
- [ ] Convert the preview pane body into an explicit `overflow-y-auto` scroll region while preserving the export target wrapper.
- [ ] Keep the code minimal and avoid touching export, pagination, and theme logic.

### Task 3: Verify the change

**Files:**
- No additional source files unless verification reveals a defect.

- [ ] Run the changed targeted tests and confirm they pass.
- [ ] Run `pnpm test` and confirm the suite passes.
- [ ] Use browser automation against `http://localhost:3000/` to verify sticky top bar behavior and preview scrolling.
- [ ] Export a real PNG and compare the downloaded file content against the left-side Markdown source before declaring completion.
