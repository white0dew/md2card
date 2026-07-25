import type { DesignPresetId } from "@/lib/design-presets";
import type { SocialFontScaleMode } from "@/stores/settings-store";

export type AgentConfigSource = {
  cardHeight: number;
  cardWidth: number;
  selectedPreset: DesignPresetId;
  selectedTheme: string;
  socialAccentColor: string;
  socialAvatarSize: number;
  socialProfileAvatarUrl: string;
  socialBackgroundColor: string;
  socialFirstPageTopOffset: number;
  socialFontPreset: string;
  socialFontScale: number;
  socialFontScaleMode: SocialFontScaleMode;
  socialLineHeight: number;
  socialProfileName: string;
  socialProfileTimeLabel: string;
  socialUseAutoTimeLabel: boolean;
};

export function buildAgentConfig(source: AgentConfigSource) {
  return {
    theme: source.selectedTheme,
    canvas: {
      preset: source.selectedPreset,
      width: source.cardWidth,
      ...(source.selectedPreset === "custom" ? { height: source.cardHeight } : {}),
    },
    profile: {
      name: source.socialProfileName,
      timeLabel: source.socialUseAutoTimeLabel ? undefined : source.socialProfileTimeLabel,
      avatarUrl: source.socialProfileAvatarUrl,
      firstPageTopOffset: source.socialFirstPageTopOffset,
      avatarSize: source.socialAvatarSize,
    },
    social: {
      backgroundColor: source.socialBackgroundColor,
      accentColor: source.socialAccentColor,
      fontPreset: source.socialFontPreset,
      fontScaleMode: source.socialFontScaleMode,
      fontScale: source.socialFontScale,
      lineHeight: source.socialLineHeight,
    },
    output: { pixelRatio: 2 },
    security: { allowHtml: false },
  };
}
