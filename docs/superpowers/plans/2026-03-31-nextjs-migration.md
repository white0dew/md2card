# MD2Card Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move MD2Card from Vite to Next.js 16 App Router without changing its core editor, preview, persistence, and export workflow.

**Architecture:** A server-rendered App Router shell hosts a client-only workbench. Browser-only concerns are isolated to client components and helpers, while theme registration and shared types are centralized in `lib/`.

**Tech Stack:** Next.js 16.2.1, React 19.2.4, TypeScript, Tailwind CSS, Zustand, Monaco Editor, Marked, Styled Components.

---

### Task 1: Replace project entrypoints and package configuration

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Modify: `package.json`
- Modify: `tsconfig.json`
- Create: `next.config.ts`
- Modify: `eslint.config.js`
- Modify: `tailwind.config.js`
- Modify: `postcss.config.js`

- [ ] Remove Vite-specific scripts and dependencies.
- [ ] Add Next.js runtime and matching lint config.
- [ ] Switch TypeScript config to a Next.js-compatible single-project layout.
- [ ] Enable Styled Components compilation.
- [ ] Move global styling entry to `app/globals.css`.

### Task 2: Build the App Router workbench shell

**Files:**
- Create: `components/workbench/workbench.tsx`
- Create: `components/workbench/top-bar.tsx`
- Create: `components/workbench/editor-pane.tsx`
- Create: `components/workbench/preview-pane.tsx`
- Create: `components/workbench/settings-sidebar.tsx`
- Create: `components/workbench/hydration-shell.tsx`
- Create: `hooks/use-hydrated.ts`

- [ ] Create a client workbench root.
- [ ] Dynamically load Monaco in a client-only editor pane.
- [ ] Preserve current layout and actions in the workbench shell.
- [ ] Gate persisted UI rendering behind hydration.

### Task 3: Migrate shared logic and stores

**Files:**
- Create: `lib/card-types.ts`
- Create: `lib/card-registry.ts`
- Create: `lib/markdown.ts`
- Create: `lib/export-to-image.ts`
- Create: `lib/paginator-utils.tsx`
- Create: `lib/paginated-markdown-viewer.tsx`
- Create: `lib/long-markdown-viewer.tsx`
- Create: `stores/editor-store.ts`
- Create: `stores/settings-store.ts`
- Create: `stores/theme-store.ts`

- [ ] Replace `import.meta.glob` with a static registry.
- [ ] Wrap markdown parsing and PNG export in shared helpers.
- [ ] Keep Zustand persistence with safe client storage access.
- [ ] Preserve pagination behavior in browser-only helpers.

### Task 4: Move and update card/theme components

**Files:**
- Create: `components/cards/*.tsx`

- [ ] Re-home existing card components under the new structure.
- [ ] Point all card files to shared types from `lib/card-types.ts`.
- [ ] Preserve current theme names and renderers.

### Task 5: Clean up old Vite files and verify migration

**Files:**
- Delete or retire: `src/main.tsx`, `src/App.tsx`, `src/App.css`, `src/themeConfigs.tsx`, `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `src/vite-env.d.ts`
- Optional cleanup: remaining unused `src/` files after migration

- [ ] Remove obsolete Vite entrypoints and config.
- [ ] Run `pnpm install`.
- [ ] Run `pnpm build`.
- [ ] Run `pnpm lint` if supported by final configuration.
- [ ] Record any remaining gaps if verification does not pass cleanly.
