export type SocialNoteFontPreset = "songti" | "heiti" | "rounded";

export interface SocialNoteFontOption {
  label: string;
  value: SocialNoteFontPreset;
  fontFamily: string;
}

export const socialNoteFontOptions: SocialNoteFontOption[] = [
  {
    label: "宋体风",
    value: "songti",
    fontFamily: '"Songti SC", "STSong", "Noto Serif SC", serif',
  },
  {
    label: "黑体风",
    value: "heiti",
    fontFamily: '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif',
  },
  {
    label: "圆体风",
    value: "rounded",
    fontFamily:
      '"Hiragino Maru Gothic ProN", "SF Pro Rounded", "Arial Rounded MT Bold", "Noto Sans SC", sans-serif',
  },
];

export const defaultSocialNoteFontPreset = socialNoteFontOptions[0].value;
export const defaultSocialNoteFontFamily = socialNoteFontOptions[0].fontFamily;

export function resolveSocialNoteFontPreset(
  value: string | null | undefined,
): SocialNoteFontPreset {
  if (!value) {
    return defaultSocialNoteFontPreset;
  }

  return socialNoteFontOptions.some((option) => option.value === value)
    ? (value as SocialNoteFontPreset)
    : defaultSocialNoteFontPreset;
}

export function getSocialNoteFontFamily(
  preset: SocialNoteFontPreset | string | null | undefined,
) {
  const resolvedPreset = resolveSocialNoteFontPreset(preset);
  return (
    socialNoteFontOptions.find((option) => option.value === resolvedPreset)?.fontFamily ??
    defaultSocialNoteFontFamily
  );
}
