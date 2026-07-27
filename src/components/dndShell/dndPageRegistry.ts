import type { DndAppPage } from "../../integration/dmForgeRoute";

export type DndHomeCard = {
  page: DndAppPage;
  icon: string;
  title: string;
  description: string;
};

export const dndPageLabels: Record<DndAppPage, string> = {
  home: "Home",
  rules: "Rules Guide",
  coverage: "Rules Coverage",
  conditions: "Conditions & Exhaustion",
  movement: "Movement & Special Actions",
  health: "HP & Death Saves",
  combat: "Initiative & Concentration",
  pregens: "Premade Characters",
  mastery: "Weapon Mastery",
  armor: "Armor & Loadout",
  compendium: "SRD Compendium",
  player: "Player Workspace",
  dm: "DM Workspace",
  monster: "Monster Encounter",
  homebrew: "Card Builder",
  "monster-homebrew": "Monster Builder"
};

export const dndNavigationLabels: Record<DndAppPage, string> = {
  home: "Home",
  rules: "Rules Guide",
  coverage: "Coverage",
  conditions: "Conditions",
  movement: "Movement",
  health: "Health",
  combat: "Combat",
  pregens: "Pregens",
  mastery: "Mastery",
  armor: "Armor",
  compendium: "Compendium",
  player: "Player",
  dm: "DM",
  monster: "Encounter",
  homebrew: "Card Builder",
  "monster-homebrew": "Monster Builder"
};

export const dndNavigationPages: DndAppPage[] = [
  "home", "rules", "coverage", "conditions", "movement", "health", "combat",
  "pregens", "mastery", "armor", "compendium", "player", "dm", "monster",
  "homebrew", "monster-homebrew"
];

export const dndHomeCards: DndHomeCard[] = [
  { page: "rules", icon: "📖", title: "Rules Guide", description: "Learn the table procedure first, then open the matching card." },
  { page: "coverage", icon: "🧭", title: "Rules Coverage", description: "See what is complete, automated, missing, or requires an owned source." },
  { page: "conditions", icon: "⚠️", title: "Conditions & Exhaustion", description: "Search every condition without mixing edition rules." },
  { page: "movement", icon: "🏃", title: "Movement & Special Actions", description: "Calculate movement, jumps, cover, grapples, shoves, hiding, and reactions." },
  { page: "health", icon: "❤️", title: "HP & Death Saves", description: "Track damage, Temporary HP, stabilization, Bloodied, and Death Saves." },
  { page: "combat", icon: "⏱️", title: "Initiative & Concentration", description: "Run rounds, turns, reactions, surprise, and timed effects." },
  { page: "pregens", icon: "🧑‍🤝‍🧑", title: "Premade Characters", description: "Open edition-separated, Vault Ready character sheets and Play Mode." },
  { page: "mastery", icon: "⚔️", title: "Weapon Mastery", description: "Run all eight 2024 mastery properties with weapon lookup and limits." },
  { page: "armor", icon: "🛡️", title: "Armor & Loadout", description: "Calculate AC, training penalties, Speed, carrying, and encumbrance." },
  { page: "compendium", icon: "📚", title: "SRD Compendium", description: "Search every generated SRD 5.1 and 5.2.1 spell and monster." },
  { page: "player", icon: "🧙", title: "Player Workspace", description: "Keep attacks, spells, checks, saves, and resources on My Table." },
  { page: "dm", icon: "🎲", title: "DM Workspace", description: "Prepare checks, traps, items, generators, and random tables." },
  { page: "monster", icon: "🐉", title: "Monster Encounter", description: "Build separate 2014 and 2024 encounter-card tables." },
  { page: "homebrew", icon: "🛠️", title: "Card Builder", description: "Build exact-edition cards beside a universal-size live preview." },
  { page: "monster-homebrew", icon: "🧌", title: "Monster Builder", description: "Create, save, and print private custom monster folios." }
];
