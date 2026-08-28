import type { DndAppPage } from "../../integration/dmForgeRoute";

export const dndPageLabels: Record<DndAppPage, string> = {
  home: "Home",
  rules: "Rules Guide",
  coverage: "Rules Coverage",
  conditions: "Conditions & Exhaustion",
  movement: "Movement & Special Actions",
  health: "HP & Death Saves",
  combat: "Initiative & Concentration",
  fight: "Fight Cards",
  pregens: "Premade Characters",
  mastery: "Weapon Mastery",
  armor: "Armor & Loadout",
  compendium: "SRD Compendium",
  catalog: "Card Catalog",
  adventures: "Adventure Packs",
  player: "Player Workspace",
  dm: "DM Workspace",
  monster: "Monster Encounter",
  library: "Private Card Library",
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
  fight: "Fight Cards",
  pregens: "Pregens",
  mastery: "Mastery",
  armor: "Armor",
  compendium: "Compendium",
  catalog: "Card Catalog",
  adventures: "Adventures",
  player: "Player",
  dm: "DM",
  monster: "Encounter",
  library: "Private Library",
  homebrew: "Card Builder",
  "monster-homebrew": "Monster Builder"
};

export const dndNavigationPages: DndAppPage[] = [
  "home", "fight", "pregens", "rules", "coverage", "conditions", "movement", "health", "combat",
  "mastery", "armor", "compendium", "catalog", "adventures", "player", "dm", "monster",
  "library", "homebrew", "monster-homebrew"
];
