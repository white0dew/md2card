import type { CardConfig } from "@/lib/card-types";
import defaultCard from "@/components/cards/DefaultCard";
import editorialCard from "@/components/cards/EditorialCard";
import socialNoteCard from "@/components/cards/SocialNoteCard";
import terminalCard from "@/components/cards/TerminalCard";

const configs = [
  defaultCard,
  socialNoteCard,
  editorialCard,
  terminalCard,
];

export const cardComponents = configs.reduce<Record<string, CardConfig>>(
  (accumulator, config) => {
    accumulator[config.name] = config;
    return accumulator;
  },
  {},
);

export const configNames = configs.map((config) => config.name);
