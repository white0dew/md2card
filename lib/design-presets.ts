export const designPresets = {
  xiaohongshu: {
    label: "小红书 3:4",
    ratio: 4 / 3,
    recommendedWidth: 1080,
    recommendedHeight: 1440,
  },
  portrait: {
    label: "竖版 9:16",
    ratio: 16 / 9,
    recommendedWidth: 1080,
    recommendedHeight: 1920,
  },
  social: {
    label: "社媒 4:5",
    ratio: 5 / 4,
    recommendedWidth: 1080,
    recommendedHeight: 1350,
  },
  "16:9": { label: "16:9", ratio: 9 / 16, recommendedWidth: 1280, recommendedHeight: 720 },
  "4:3": { label: "4:3", ratio: 3 / 4, recommendedWidth: 1200, recommendedHeight: 900 },
  "1:1": { label: "1:1", ratio: 1, recommendedWidth: 1080, recommendedHeight: 1080 },
  custom: { label: "自定义", ratio: null, recommendedWidth: null, recommendedHeight: null },
} as const;

export type DesignPresetId = keyof typeof designPresets;
export const defaultPresetId: DesignPresetId = "xiaohongshu";
export const defaultCanvasSize = { width: 440, height: 587 } as const;

export function calculatePresetHeight(width: number, preset: Exclude<DesignPresetId, "custom">) {
  return Math.round(width * designPresets[preset].ratio);
}

export function calculatePresetExportSize(
  renderedWidth: number,
  renderedHeight: number,
  preset: DesignPresetId,
) {
  if (preset === "custom") {
    return {
      width: renderedWidth,
      height: renderedHeight,
    };
  }

  const recommendedWidth = designPresets[preset].recommendedWidth;
  const scale = recommendedWidth / renderedWidth;

  return {
    width: recommendedWidth,
    height: Math.round(renderedHeight * scale),
  };
}

export function inferPreset(width: number, height: number): DesignPresetId {
  const matched = (Object.keys(designPresets) as DesignPresetId[]).find((preset) => {
    if (preset === "custom") {
      return false;
    }

    return calculatePresetHeight(width, preset) === height;
  });

  return matched ?? "custom";
}
