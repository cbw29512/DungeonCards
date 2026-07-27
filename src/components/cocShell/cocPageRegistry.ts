import type { CocAppPage } from "../../integration/dmForgeRoute";

export type CocHomeCard = {
  page: CocAppPage;
  eyebrow: string;
  title: string;
  description: string;
};

export const cocPageLabels: Record<CocAppPage, string> = {
  home: "Home",
  investigator: "Investigator",
  keeper: "Keeper",
  rules: "Rules",
  equipment: "Equipment",
  spells: "Spells & Rituals",
  creatures: "Creatures & NPCs",
  encounters: "Encounters",
  library: "Private Card Library",
  builders: "Builders",
  sources: "Sources & Licensing"
};

export const cocNavigationPages: CocAppPage[] = [
  "home", "investigator", "keeper", "rules", "equipment", "spells",
  "creatures", "encounters", "library", "builders", "sources"
];

export const cocHomeCards: CocHomeCard[] = [
  { page: "investigator", eyebrow: "Player desk", title: "Investigator", description: "Checks, Sanity, injury, healing, advancement, and quick-reference cards." },
  { page: "keeper", eyebrow: "Case command", title: "Keeper", description: "Mystery flow, essential clues, NPC pressure, opposition clocks, and records." },
  { page: "rules", eyebrow: "Verified procedure", title: "Rules", description: "Open the complete table-procedure guide and source status." },
  { page: "equipment", eyebrow: "Physical evidence", title: "Equipment", description: "Weapon, firearm, ammunition, injury, and treatment procedures." },
  { page: "spells", eyebrow: "Occult cost", title: "Spells & Rituals", description: "Track casting, pushed attempts, Magic Points, time, and original rituals." },
  { page: "creatures", eyebrow: "Keeper folio", title: "Creatures & NPCs", description: "Open combat-ready dossiers with private Keeper-facing information." },
  { page: "encounters", eyebrow: "Danger desk", title: "Encounters", description: "Run DEX order, contested actions, firearms, wounds, escape, and aftermath." },
  { page: "library", eyebrow: "Private archive", title: "Private Card Library", description: "Validate, import, search, print, and export exact CoC 7e card archives." },
  { page: "builders", eyebrow: "Private creation", title: "Builders", description: "Create a rules-grounded Investigator without importing paid-book catalogs." },
  { page: "sources", eyebrow: "Trust boundary", title: "Sources & Licensing", description: "See what is verified, original, public, licensed, or deliberately excluded." }
];
