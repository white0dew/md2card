"use client";

import { useEffect, useState } from "react";
import { downloadBlob, renderElementToPngBlob } from "@/lib/export-to-image";
import { buildArchiveName, createArchiveBlob } from "@/lib/export-archive";
import { buildExportPlan } from "@/lib/export-plan";
import { useHydrated } from "@/hooks/use-hydrated";
import EditorPane from "@/components/workbench/editor-pane";
import HydrationShell from "@/components/workbench/hydration-shell";
import PreviewPane from "@/components/workbench/preview-pane";
import SettingsSidebar from "@/components/workbench/settings-sidebar";
import TopBar from "@/components/workbench/top-bar";
import useSettingsStore from "@/stores/settings-store";

export default function Workbench() {
  const hydrated = useHydrated();
  const { selectedPreset } = useSettingsStore();
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success" | "error">("idle");
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  useEffect(() => {
    if (exportStatus !== "success") {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setExportStatus("idle");
      setExportMessage(null);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [exportStatus]);

  const handleExport = async () => {
    const preview = document.getElementById("preview");
    if (!preview) {
      setExportStatus("error");
      setExportMessage("未找到可导出的预览区域。");
      return;
    }

    try {
      setExportStatus("exporting");
      setExportMessage("正在生成 PNG 文件...");
      const pageNodes = Array.from(
        preview.querySelectorAll<HTMLElement>(".pages-wrapper > *"),
      );
      const exportTargets = pageNodes.length > 0 ? pageNodes : [preview];
      const exportPlan = buildExportPlan({
        cardCount: exportTargets.length,
        fileName: "md2card.png",
        preset: selectedPreset,
        renderedHeight: exportTargets[0].offsetHeight,
        renderedWidth: exportTargets[0].offsetWidth,
      });

      const blobs = [];
      for (const [index, target] of exportTargets.entries()) {
        const planItem = exportPlan[Math.min(index, exportPlan.length - 1)];
        const blob = await renderElementToPngBlob(target, {
          canvasWidth: planItem.canvasWidth,
          canvasHeight: planItem.canvasHeight,
        });
        blobs.push({ fileName: planItem.fileName, blob });
      }

      if (blobs.length > 1) {
        const archiveBlob = await createArchiveBlob(blobs);
        downloadBlob(archiveBlob, buildArchiveName("md2card.png"));
      } else if (blobs.length === 1) {
        downloadBlob(blobs[0].blob, blobs[0].fileName);
      }

      setExportStatus("success");
      setExportMessage(
        exportPlan.length > 1
          ? `已导出 ${exportPlan.length} 张 PNG，并打包为 ZIP，尺寸 ${exportPlan[0].canvasWidth}×${exportPlan[0].canvasHeight}。`
          : selectedPreset === "custom"
            ? "PNG 已生成，浏览器应已开始下载。"
            : `PNG 已生成，按 ${exportPlan[0].canvasWidth}×${exportPlan[0].canvasHeight} 导出。`,
      );
    } catch (error) {
      setExportStatus("error");
      setExportMessage(
        error instanceof Error ? error.message : "导出失败，请稍后重试。",
      );
    }
  };

  return (
    <HydrationShell hydrated={hydrated}>
      <div className="flex min-h-screen w-full flex-col bg-slate-100">
        <TopBar
          exportMessage={exportMessage}
          exportStatus={exportStatus}
          onExport={handleExport}
        />
        <main className="flex-1 px-4 py-4 lg:px-5 lg:py-5 xl:overflow-hidden">
          <div className="mx-auto grid w-full max-w-[1680px] grid-cols-1 items-start gap-5 xl:h-full xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)_320px]">
            <div className="min-w-0 xl:h-full">
              <EditorPane />
            </div>
            <div className="min-w-0 xl:h-full">
              <PreviewPane />
            </div>
            <div className="min-w-0">
              <SettingsSidebar />
            </div>
          </div>
        </main>
      </div>
    </HydrationShell>
  );
}
