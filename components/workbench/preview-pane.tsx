"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import usePersistHydration from "@/hooks/use-persist-hydration";
import { cardComponents } from "@/lib/card-registry";
import LongMarkdownViewer from "@/lib/long-markdown-viewer";
import { parseMarkdown } from "@/lib/markdown";
import PaginatedMarkdownViewer from "@/lib/paginated-markdown-viewer";
import useEditorStore from "@/stores/editor-store";
import useSettingsStore from "@/stores/settings-store";

export default function PreviewPane() {
  const content = useEditorStore((state) => state.content);
  const selectedTheme = useSettingsStore((state) => state.selectedTheme);
  const cardWidth = useSettingsStore((state) => state.cardWidth);
  const cardHeight = useSettingsStore((state) => state.cardHeight);
  const viewMode = useSettingsStore((state) => state.viewMode);
  const hideOverflow = useSettingsStore((state) => state.hideOverflow);
  const editorHydrated = usePersistHydration(useEditorStore);
  const settingsHydrated = usePersistHydration(useSettingsStore);
  const previewReady = editorHydrated && settingsHydrated;
  const deferredContent = useDeferredValue(previewReady ? content : "");
  const [html, setHtml] = useState("");

  const selectedCard = useMemo(
    () => cardComponents[selectedTheme] ?? cardComponents["默认"],
    [selectedTheme],
  );

  useEffect(() => {
    if (!previewReady) {
      setHtml("");
      return undefined;
    }

    if (!deferredContent) {
      setHtml("");
      return undefined;
    }

    let cancelled = false;

    parseMarkdown(deferredContent, selectedCard.renderer).then((parsedHtml) => {
      if (!cancelled) {
        startTransition(() => {
          setHtml(parsedHtml);
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [deferredContent, previewReady, selectedCard]);

  return (
    <section
      className="preview-container flex h-full min-h-[720px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] xl:h-full xl:min-h-0"
    >
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">实时预览</p>
          <p className="text-xs text-slate-500">导出结果以这里的卡片内容为准。</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {viewMode}
        </div>
      </div>
      <div className="preview-scroll-area min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-2">
        <div
          className={`mx-auto w-full ${hideOverflow ? "overflow-hidden" : "overflow-visible"}`}
          id="preview"
        >
          {!previewReady ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
              正在恢复预览内容...
            </div>
          ) : viewMode === "长卡片" ? (
            <LongMarkdownViewer
              CardComponent={selectedCard.component}
              html={html}
              pageWidth={cardWidth}
            />
          ) : (
            <PaginatedMarkdownViewer
              CardComponent={selectedCard.component}
              html={html}
              pageHeight={cardHeight}
              pageWidth={cardWidth}
            />
          )}
        </div>
      </div>
    </section>
  );
}
