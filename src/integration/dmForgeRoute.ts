export type DndAppPage =
  | "home"
  | "rules"
  | "coverage"
  | "conditions"
  | "compendium"
  | "player"
  | "dm"
  | "monster"
  | "homebrew"
  | "monster-homebrew";

export type DungeonCardsSystem = "dnd-5e" | "coc-7e";

const DND_PAGES = new Set<DndAppPage>([
  "home",
  "rules",
  "coverage",
  "conditions",
  "compendium",
  "player",
  "dm",
  "monster",
  "homebrew",
  "monster-homebrew"
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

export function dndRoute(page: DndAppPage): string {
  const parameters = new URLSearchParams({ system: "dnd", page });
  return `?${parameters.toString()}`;
}

export function replaceDndRoute(page: DndAppPage): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.search = new URLSearchParams({ system: "dnd", page }).toString();
  window.history.replaceState(null, "", url);
}

export function clearSystemRoute(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.search = "";
  window.history.replaceState(null, "", url);
}
