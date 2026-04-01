"use client";

import { useEffect, useMemo, useState } from "react";
import { cardComponents } from "@/lib/card-registry";
import LongMarkdownViewer from "@/lib/long-markdown-viewer";
import { parseMarkdown } from "@/lib/markdown";
import PaginatedMarkdownViewer from "@/lib/paginated-markdown-viewer";
import useEditorStore from "@/stores/editor-store";
import useSettingsStore from "@/stores/settings-store";

export default function PreviewPane() {
  const { content } = useEditorStore();
  const { selectedTheme, cardWidth, cardHeight, viewMode, hideOverflow } =
    useSettingsStore();
  const [html, setHtml] = useState("");

  const selectedCard = useMemo(
    () => cardComponents[selectedTheme] ?? cardComponents["默认"],
    [selectedTheme],
  );

  useEffect(() => {
    let cancelled = false;

    parseMarkdown(content, selectedCard.renderer).then((parsedHtml) => {
      if (!cancelled) {
        setHtml(parsedHtml);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [content, selectedCard]);

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
      <div className="min-h-0 flex-1 overflow-auto">
        <div
          className={`mx-auto w-full ${hideOverflow ? "overflow-hidden" : "overflow-visible"}`}
          id="preview"
        >
          {viewMode === "长卡片" ? (
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
