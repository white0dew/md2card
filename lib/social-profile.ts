export interface SocialProfile {
  name: string;
  timeLabel: string;
  avatarUrl: string;
}

export const defaultSocialProfile: SocialProfile = {
  name: "阿亮",
  timeLabel: "03/30",
  avatarUrl: "/social-avatar.svg",
};

export function resolveSocialProfile(
  profile?: Partial<SocialProfile> | null,
): SocialProfile {
  return {
    name: profile?.name?.trim() || defaultSocialProfile.name,
    timeLabel: profile?.timeLabel?.trim() || defaultSocialProfile.timeLabel,
    avatarUrl: profile?.avatarUrl?.trim() || defaultSocialProfile.avatarUrl,
  };
}
