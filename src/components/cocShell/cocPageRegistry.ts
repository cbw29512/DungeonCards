import type { CocAppPage } from "../../integration/dmForgeRoute";

export const cocPageLabels: Record<CocAppPage, string> = {
  home: "Home",
  investigator: "Investigator",
  keeper: "Keeper",
  rules: "Rules",
  catalog: "Card Catalog",
  equipment: "Equipment",
  spells: "Spells & Rituals",
  creatures: "Creatures & NPCs",
  encounters: "Encounters",
  library: "Private Card Library",
  builders: "Builders",
  sources: "Sources & Licensing"
};

export const cocNavigationPages: CocAppPage[] = [
  "home", "investigator", "keeper", "rules", "catalog", "equipment", "spells",
  "creatures", "encounters", "library", "builders", "sources"
];
