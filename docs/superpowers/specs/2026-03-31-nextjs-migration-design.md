# MD2Card Next.js Migration Design

## Goal

Refactor the current Vite-based MD2Card SPA into a Next.js 16.2.1 application using App Router while preserving the existing editor, preview, local persistence, and browser-side PNG export behavior.

## Constraints

- Keep the product as a single-page editing workbench.
- Preserve current UI behavior as closely as practical.
- Keep Monaco editor, markdown preview, pagination, and PNG export working in the browser.
- Avoid server-side execution of browser-only code.

## Architecture

- Use `app/layout.tsx` and `app/page.tsx` as the Next.js App Router entrypoints.
- Mount the main workbench from a client component.
- Split the workbench into top bar, editor pane, preview pane, and settings sidebar.
- Keep card theme components, but replace the Vite-only theme discovery with a static registry.
- Move markdown rendering, image export, and card registry logic into `lib/`.
- Keep persisted Zustand stores in `stores/` with safe client-side storage initialization.

## Browser-only Boundaries

The following must only run in client components or client-side helpers:

- `@monaco-editor/react`
- `html-to-image`
- `window.monaco`
- DOM pagination helpers using `document`
- `localStorage` persistence

## File Layout

- `app/`
  - `layout.tsx`
  - `page.tsx`
  - `globals.css`
- `components/workbench/`
  - `workbench.tsx`
  - `top-bar.tsx`
  - `editor-pane.tsx`
  - `preview-pane.tsx`
  - `settings-sidebar.tsx`
  - `hydration-shell.tsx`
- `components/cards/`
  - existing card theme files, updated to new shared types
- `lib/`
  - `card-registry.ts`
  - `card-types.ts`
  - `markdown.ts`
  - `export-to-image.ts`
  - `paginator-utils.tsx`
  - `long-markdown-viewer.tsx`
  - `paginated-markdown-viewer.tsx`
- `stores/`
  - `editor-store.ts`
  - `settings-store.ts`
  - `theme-store.ts`
- `hooks/`
  - `use-hydrated.ts`
- `public/`
  - static assets used by docs or the UI

## Validation

- Install dependencies with `pnpm install`.
- Verify the application compiles with `pnpm build`.
- Verify lint status with `pnpm lint` if the final config supports it cleanly.
