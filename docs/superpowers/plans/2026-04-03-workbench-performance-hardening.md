# MD2Card Workbench Performance Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the three highest-priority workbench performance bottlenecks in editor persistence, pagination work scheduling, and top-level store subscriptions.

**Architecture:** The editor keeps an immediate local draft and persists on a buffered path. Pagination remains DOM-measurement based, but uses reusable measurement shells and cooperative yielding so stale work can be abandoned. The workbench root subscribes only to the preset value it actually needs.

**Tech Stack:** Next.js 16.2.1, React 19.2.4, TypeScript, Zustand, Monaco Editor, Marked, Styled Components.

---

### Task 1: Buffer editor persistence instead of writing on every keystroke

**Files:**
- Modify: `components/workbench/editor-pane.tsx`
- Test: `tests/editor-performance.test.ts`

- [ ] Write a failing test that asserts editor updates no longer call `setContent` directly from the Monaco `onChange` handler and that buffered persistence primitives exist.
- [ ] Run the targeted test and confirm it fails for the current direct-write implementation.
- [ ] Implement local draft state plus delayed flush/cleanup flush in the editor pane.
- [ ] Run the targeted test and confirm it passes.

### Task 2: Make pagination work reusable and cooperatively interruptible

**Files:**
- Modify: `lib/pagination-card-measurement.tsx`
- Modify: `lib/paginated-markdown-viewer.tsx`
- Test: `tests/pagination-performance-hardening.test.ts`

- [ ] Write a failing test that asserts measurement shell caching exists and pagination performs cooperative yield/cancel checks.
- [ ] Run the targeted test and confirm it fails against the current single-block loop.
- [ ] Implement reusable measurement shells plus consistent teardown helpers in the measurement layer.
- [ ] Implement batched yielding and stale-work cancellation checks in the paginated viewer.
- [ ] Run the targeted test and confirm it passes.

### Task 3: Narrow workbench store subscriptions

**Files:**
- Modify: `components/workbench/workbench.tsx`
- Test: `tests/workbench-performance.test.ts`

- [ ] Write a failing test that asserts `Workbench` uses a selector subscription instead of subscribing to the entire settings store object.
- [ ] Run the targeted test and confirm it fails.
- [ ] Switch `Workbench` to `useSettingsStore((state) => state.selectedPreset)`.
- [ ] Run the targeted test and confirm it passes.

### Task 4: Verify end-to-end behavior

**Files:**
- No source changes required unless verification reveals a defect.

- [ ] Run the changed targeted tests together.
- [ ] Run `pnpm test`.
- [ ] Run eslint on changed files.
- [ ] Start a local app instance suitable for browser testing.
- [ ] Use browser automation to edit content, exercise preview updates, export PNG/ZIP, and verify the downloaded output against the source Markdown.
