import { defaultSocialProfile } from "@/lib/social-profile";

const defaultSocialReservedHeight = 176;

export function getSocialNoteUsableHeight(
  pageHeight: number,
  firstPageTopOffset = defaultSocialProfile.firstPageTopOffset,
  avatarSize = defaultSocialProfile.avatarSize,
) {
  const reservedHeight =
    defaultSocialReservedHeight +
    Math.max(0, firstPageTopOffset - defaultSocialProfile.firstPageTopOffset) +
    Math.max(0, avatarSize - defaultSocialProfile.avatarSize);

  return Math.max(120, pageHeight - reservedHeight);
}
