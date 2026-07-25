"use client";

import { createContext, type ReactNode } from "react";
import type { HeadlessProfile, HeadlessSocialPresentation } from "@/lib/headless-input";

export const HeadlessSocialProfileContext = createContext<{
  profile: HeadlessProfile;
  presentation: HeadlessSocialPresentation;
} | null>(null);

export function HeadlessSocialProfileProvider({
  children,
  profile,
  presentation,
}: {
  children: ReactNode;
  profile: HeadlessProfile;
  presentation: HeadlessSocialPresentation;
}) {
  return (
    <HeadlessSocialProfileContext.Provider value={{ profile, presentation }}>
      {children}
    </HeadlessSocialProfileContext.Provider>
  );
}
