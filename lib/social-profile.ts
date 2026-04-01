export interface SocialProfile {
  name: string;
  timeLabel: string;
  avatarUrl: string;
}

export const defaultSocialProfile: Omit<SocialProfile, "timeLabel"> = {
  name: "阿亮",
  avatarUrl: "/social-avatar.svg",
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
  };
}
