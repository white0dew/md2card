# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev`
- Build production bundle: `pnpm build`
- Start production server: `pnpm start`
- Lint: `pnpm lint`
- Run all tests: `pnpm test`
- Run a single test file: `pnpm test -- tests/export-plan.test.ts`
- Verify browser export against OCR: `pnpm verify:export -- --markdown /absolute/path/to/demo.md`

## Repository context

- This is a Next.js App Router app. The route surface is minimal: `app/page.tsx` renders the workbench directly, and `app/layout.tsx` only provides global shell/metadata.
- The main product flow lives in `components/workbench/workbench.tsx`: it composes the Monaco editor, preview pane, settings sidebar, and the export action.
- Editor content and UI settings are persisted separately in Zustand stores backed by `localStorage`:
  - `stores/editor-store.ts` stores Markdown content.
  - `stores/settings-store.ts` stores card dimensions, preset, theme, view mode, overflow behavior, and social profile fields.
- Preview rendering is a two-step pipeline:
  1. `lib/markdown.ts` converts Markdown to HTML with `marked`, using the selected theme renderer from `lib/card-registry.ts`.
  2. `components/workbench/preview-pane.tsx` chooses either `lib/long-markdown-viewer.tsx` or `lib/paginated-markdown-viewer.tsx` based on the current view mode.
- Card themes are registry-driven. `lib/card-registry.ts` maps human-readable theme names to card configs from `components/cards/*.tsx`. Theme-specific rendering behavior should usually be added through that registry instead of branching inside the workbench.
- Pagination logic is one of the core pieces of the app. `lib/paginated-markdown-viewer.tsx` orchestrates DOM measurement and page splitting, while the detailed rules live in the pagination helpers (`lib/pagination-*.ts*`, `lib/paginator-utils.tsx`). If a change affects short-card layout, page breaks, tables, lists, or images, read those helpers together rather than editing the viewer in isolation.
- Export is browser-side, not server-side:
  - `components/workbench/workbench.tsx` collects one or more preview nodes from `#preview`.
  - `lib/export-plan.ts` decides output filenames and canvas sizes from the selected preset and page count.
  - `lib/export-to-image.ts` renders DOM nodes to PNG via `html-to-image`.
  - `lib/export-archive.ts` zips multi-page exports with JSZip.
- Design presets in `lib/design-presets.ts` are split between editing size and export size: the UI edits on a smaller canvas (`defaultCanvasSize`), while export scales to preset-specific recommended dimensions. Be careful not to conflate preview dimensions with final PNG dimensions.
- The app has a theme-specific social profile feature. `stores/settings-store.ts` persists the editable profile fields, `lib/social-profile.ts` normalizes defaults, and `components/workbench/settings-sidebar.tsx` only exposes those inputs when the `社交图文` theme is selected.
- Automated export verification is implemented as a CLI script in `scripts/verify-export.ts`. It seeds localStorage in a browser session, triggers the real export button, captures the downloaded PNG/ZIP, OCRs the output via `scripts/ocr-image.swift`, and compares OCR text with preview text. Use this when validating export correctness; visual preview alone is not sufficient.
- Tests are file-oriented and use `tsx --test` with focused modules in `tests/*.test.ts`. Coverage is strongest around pure logic modules such as presets, export planning, pagination helpers, registry behavior, and social-note formatting.

## Existing repo guidance to keep in mind

- `AGENTS.md` requires Simplified Chinese for normal responses.
- For Markdown-to-image changes, do not treat on-screen preview as sufficient validation; perform a real PNG export and compare exported content for truncation or missing text.
- `next.config.ts` sets `allowedDevOrigins: ["127.0.0.1"]` and enables `styledComponents`; keep that in mind when changing local dev or rendering configuration.
