"use client";

import { createContext, type ReactNode } from "react";
import type { HeadlessProfile } from "@/lib/headless-input";

export const HeadlessSocialProfileContext = createContext<HeadlessProfile | null>(null);

export function HeadlessSocialProfileProvider({
  children,
  profile,
}: {
  children: ReactNode;
  profile: HeadlessProfile;
}) {
  return (
    <HeadlessSocialProfileContext.Provider value={profile}>
      {children}
    </HeadlessSocialProfileContext.Provider>
  );
}
