import { calculatePresetExportSize, designPresets, type DesignPresetId } from "@/lib/design-presets";

interface BuildExportPlanOptions {
  renderedWidth: number;
  renderedHeight: number;
  preset: DesignPresetId;
  cardCount: number;
  fileName: string;
}

export interface ExportPlanItem {
  fileName: string;
  canvasWidth: number;
  canvasHeight: number;
}

function withPageIndex(fileName: string, pageIndex: number) {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) {
    return `${fileName}-${pageIndex}`;
  }

  return `${fileName.slice(0, dotIndex)}-${pageIndex}${fileName.slice(dotIndex)}`;
}

export function buildExportPlan({
  renderedWidth,
  renderedHeight,
  preset,
  cardCount,
  fileName,
}: BuildExportPlanOptions): ExportPlanItem[] {
  if (cardCount > 1) {
    const canvasWidth =
      preset === "custom" ? renderedWidth : designPresets[preset].recommendedWidth;
    const canvasHeight =
      preset === "custom" ? renderedHeight : designPresets[preset].recommendedHeight;

    return Array.from({ length: cardCount }, (_, index) => ({
      fileName: withPageIndex(fileName, index + 1),
      canvasWidth,
      canvasHeight,
    }));
  }

  const exportSize = calculatePresetExportSize(renderedWidth, renderedHeight, preset);

  return [
    {
      fileName,
      canvasWidth: exportSize.width,
      canvasHeight: exportSize.height,
    },
  ];
}
