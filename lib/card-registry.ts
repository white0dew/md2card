import type { CardConfig } from "@/lib/card-types";
import defaultCard from "@/components/cards/DefaultCard";
import editorialCard from "@/components/cards/EditorialCard";
import glassCard from "@/components/cards/GlassCard";
import knowledgeCard from "@/components/cards/KnowledgeCard";
import socialNoteCard from "@/components/cards/SocialNoteCard";
import terminalCard from "@/components/cards/TerminalCard";
import warmCard from "@/components/cards/WarmCard";

const configs = [
  defaultCard,
  glassCard,
  warmCard,
  socialNoteCard,
  editorialCard,
  terminalCard,
  knowledgeCard,
];

export const cardComponents = configs.reduce<Record<string, CardConfig>>(
  (accumulator, config) => {
    accumulator[config.name] = config;
    return accumulator;
  },
  {},
);

export const configNames = configs.map((config) => config.name);
