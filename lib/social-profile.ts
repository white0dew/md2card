export interface SocialProfile {
  name: string;
  timeLabel: string;
  avatarUrl: string;
  firstPageTopOffset: number;
  avatarSize: number;
}

export const defaultSocialProfile: Omit<SocialProfile, "timeLabel"> = {
  name: "阿亮",
  avatarUrl: "/social-avatar.svg",
  firstPageTopOffset: 0,
  avatarSize: 52,
};

export function getDefaultSocialProfileTimeLabel(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${month}/${day}`;
}

export function resolveSocialProfile(
  profile?: Partial<SocialProfile> | null,
  now = new Date(),
): SocialProfile {
  return {
    name: profile?.name?.trim() || defaultSocialProfile.name,
    timeLabel: profile?.timeLabel?.trim() || getDefaultSocialProfileTimeLabel(now),
    avatarUrl: profile?.avatarUrl?.trim() || defaultSocialProfile.avatarUrl,
    firstPageTopOffset:
      profile?.firstPageTopOffset ?? defaultSocialProfile.firstPageTopOffset,
    avatarSize: profile?.avatarSize ?? defaultSocialProfile.avatarSize,
  };
}
