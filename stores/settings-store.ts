"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  calculatePresetHeight,
  defaultCanvasSize,
  defaultPresetId,
  type DesignPresetId,
  inferPreset,
} from "@/lib/design-presets";
import {
  resolveSocialProfile,
} from "@/lib/social-profile";

export const viewModes = ["长卡片", "短卡片"] as const;
export type ViewMode = (typeof viewModes)[number];

interface SettingsState {
  cardWidth: number;
  cardHeight: number;
  selectedPreset: DesignPresetId;
  viewMode: ViewMode;
  hideOverflow: boolean;
  selectedTheme: string;
  socialProfileName: string;
  socialProfileTimeLabel: string;
  socialProfileAvatarUrl: string;
  setCardWidth: (width: number) => void;
  setCardHeight: (height: number) => void;
  setSelectedPreset: (preset: DesignPresetId) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setHideOverflow: (hideOverflow: boolean) => void;
  setSelectedTheme: (theme: string) => void;
  setSocialProfileName: (name: string) => void;
  setSocialProfileTimeLabel: (timeLabel: string) => void;
  setSocialProfileAvatarUrl: (avatarUrl: string) => void;
}

const defaultWidth = defaultCanvasSize.width;
const defaultHeight = defaultCanvasSize.height;
const defaultSocialState = resolveSocialProfile();

const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      cardWidth: defaultWidth,
      cardHeight: defaultHeight,
      selectedPreset: defaultPresetId,
      viewMode: "短卡片",
      hideOverflow: false,
      selectedTheme: "默认",
      socialProfileName: defaultSocialState.name,
      socialProfileTimeLabel: defaultSocialState.timeLabel,
      socialProfileAvatarUrl: defaultSocialState.avatarUrl,
      setCardWidth: (cardWidth) => {
        const { selectedPreset } = get();

        if (selectedPreset !== "custom") {
          set({
            cardWidth,
            cardHeight: calculatePresetHeight(cardWidth, selectedPreset),
          });
          return;
        }

        set({ cardWidth });
      },
      setCardHeight: (cardHeight) => {
        const { cardWidth } = get();

        set({
          cardHeight,
          selectedPreset: inferPreset(cardWidth, cardHeight),
        });
      },
      setSelectedPreset: (selectedPreset) => {
        const { cardWidth } = get();

        if (selectedPreset === "custom") {
          set({ selectedPreset });
          return;
        }

        set({
          selectedPreset,
          cardHeight: calculatePresetHeight(cardWidth, selectedPreset),
        });
      },
      setViewMode: (viewMode) => set({ viewMode }),
      setHideOverflow: (hideOverflow) => set({ hideOverflow }),
      setSelectedTheme: (selectedTheme) => set({ selectedTheme }),
      setSocialProfileName: (socialProfileName) => set({ socialProfileName }),
      setSocialProfileTimeLabel: (socialProfileTimeLabel) =>
        set({ socialProfileTimeLabel }),
      setSocialProfileAvatarUrl: (socialProfileAvatarUrl) =>
        set({ socialProfileAvatarUrl }),
    }),
    {
      name: "settings-storage",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const state = persistedState as SettingsState | undefined;

        if (!state) {
          return {
            cardWidth: defaultWidth,
            cardHeight: defaultHeight,
            selectedPreset: defaultPresetId,
            viewMode: "短卡片" as ViewMode,
            hideOverflow: false,
            selectedTheme: "默认",
            socialProfileName: defaultSocialState.name,
            socialProfileTimeLabel: defaultSocialState.timeLabel,
            socialProfileAvatarUrl: defaultSocialState.avatarUrl,
          };
        }

        const nextPreset =
          state.selectedPreset ??
          inferPreset(state.cardWidth ?? defaultWidth, state.cardHeight ?? defaultHeight);

        const width = state.cardWidth ?? defaultWidth;
        const height = state.cardHeight ?? defaultHeight;

        const shouldUpgradeLegacyShortCard =
          nextPreset === "custom" && width === 440 && height === 586;
        const socialProfile = resolveSocialProfile({
          avatarUrl: state.socialProfileAvatarUrl,
          name: state.socialProfileName,
          timeLabel: state.socialProfileTimeLabel,
        });

        return {
          ...state,
          cardWidth: shouldUpgradeLegacyShortCard ? defaultWidth : width,
          cardHeight: shouldUpgradeLegacyShortCard ? defaultHeight : height,
          selectedPreset: shouldUpgradeLegacyShortCard ? defaultPresetId : nextPreset,
          viewMode: state.viewMode ?? "短卡片",
          socialProfileName: socialProfile.name,
          socialProfileTimeLabel: socialProfile.timeLabel,
          socialProfileAvatarUrl: socialProfile.avatarUrl,
        };
      },
    },
  ),
);

export default useSettingsStore;
