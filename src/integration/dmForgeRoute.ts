export type DndAppPage =
  | "home"
  | "rules"
  | "coverage"
  | "conditions"
  | "movement"
  | "health"
  | "combat"
  | "pregens"
  | "mastery"
  | "armor"
  | "compendium"
  | "catalog"
  | "adventures"
  | "player"
  | "dm"
  | "monster"
  | "library"
  | "homebrew"
  | "monster-homebrew";

export type CocAppPage =
  | "home"
  | "investigator"
  | "keeper"
  | "rules"
  | "catalog"
  | "equipment"
  | "spells"
  | "creatures"
  | "encounters"
  | "library"
  | "builders"
  | "sources";

export type DungeonCardsSystem = "dnd-5e" | "coc-7e";

const DND_PAGES = new Set<DndAppPage>([
  "home", "rules", "coverage", "conditions", "movement", "health", "combat",
  "pregens", "mastery", "armor", "compendium", "catalog", "player", "dm", "monster",
  "adventures", "library", "homebrew", "monster-homebrew"
]);

const COC_PAGES = new Set<CocAppPage>([
  "home", "investigator", "keeper", "rules", "catalog", "equipment", "spells",
  "creatures", "encounters", "library", "builders", "sources"
]);

export const DM_FORGE_HOME = "https://cbw29512.github.io/monstercardforge/";

export function parseSystem(search: string): DungeonCardsSystem | undefined {
  const value = new URLSearchParams(search).get("system");
  if (value === "dnd" || value === "dnd-5e") return "dnd-5e";
  if (value === "coc" || value === "coc-7e") return "coc-7e";
  return undefined;
}

export function parseDndPage(search: string): DndAppPage {
  const value = new URLSearchParams(search).get("page") as DndAppPage | null;
  return value && DND_PAGES.has(value) ? value : "home";
}

export function parseCocPage(search: string): CocAppPage {
  const value = new URLSearchParams(search).get("page") as CocAppPage | null;
  return value && COC_PAGES.has(value) ? value : "home";
}

const route = (system: "dnd" | "coc", page: string): string => {
  const parameters = new URLSearchParams({ system, page });
  return `?${parameters.toString()}`;
};

export const dndRoute = (page: DndAppPage): string => route("dnd", page);
export const cocRoute = (page: CocAppPage): string => route("coc", page);

const replaceRoute = (system: "dnd" | "coc", page: string): void => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.search = new URLSearchParams({ system, page }).toString();
  window.history.replaceState(null, "", url);
};

export const replaceDndRoute = (page: DndAppPage): void => replaceRoute("dnd", page);
export const replaceCocRoute = (page: CocAppPage): void => replaceRoute("coc", page);

export function clearSystemRoute(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.search = "";
  window.history.replaceState(null, "", url);
}
