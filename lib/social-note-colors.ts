export interface SocialNoteColorOption {
  label: string;
  value: string;
}

export const socialNoteBackgroundColors: SocialNoteColorOption[] = [
  { label: "暖白", value: "#fffdf7" },
  { label: "宣纸米", value: "#f8f1e3" },
  { label: "浅杏", value: "#fff1df" },
  { label: "雾蓝", value: "#edf4fb" },
  { label: "浅荷", value: "#eff7f1" },
  { label: "淡粉", value: "#fff1f3" },
];

export const socialNoteAccentColors: SocialNoteColorOption[] = [
  { label: "墨黑", value: "#171717" },
  { label: "枣红", value: "#8b2f3f" },
  { label: "靛青", value: "#2f4f7f" },
  { label: "松绿", value: "#2f6657" },
  { label: "茶褐", value: "#7a4d2c" },
  { label: "梅紫", value: "#6b4a72" },
];

export const defaultSocialNoteBackgroundColor = socialNoteBackgroundColors[0].value;
export const defaultSocialNoteAccentColor = socialNoteAccentColors[0].value;

function resolveSocialNoteColor(
  value: string | null | undefined,
  options: SocialNoteColorOption[],
  fallback: string,
) {
  if (!value) {
    return fallback;
  }

  return options.some((option) => option.value === value) ? value : fallback;
}

export function resolveSocialNoteBackgroundColor(value: string | null | undefined) {
  return resolveSocialNoteColor(
    value,
    socialNoteBackgroundColors,
    defaultSocialNoteBackgroundColor,
  );
}

export function resolveSocialNoteAccentColor(value: string | null | undefined) {
  return resolveSocialNoteColor(
    value,
    socialNoteAccentColors,
    defaultSocialNoteAccentColor,
  );
}
