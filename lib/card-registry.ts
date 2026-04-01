import type { CardConfig } from "@/lib/card-types";
import darkCard from "@/components/cards/DarkCard";
import defaultCard from "@/components/cards/DefaultCard";
import glassCard from "@/components/cards/GlassCard";
import socialNoteCard from "@/components/cards/SocialNoteCard";
import warmCard from "@/components/cards/WarmCard";

const configs = [defaultCard, darkCard, glassCard, warmCard, socialNoteCard];

export const cardComponents = configs.reduce<Record<string, CardConfig>>(
  (accumulator, config) => {
    accumulator[config.name] = config;
    return accumulator;
  },
  {},
);

export const configNames = configs.map((config) => config.name);
