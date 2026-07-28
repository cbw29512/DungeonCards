import { describe, expect, it } from "vitest";
import { cocCreatureCatalog } from "../data/cocCreatureCatalog";
import { cocInvestigatorCatalog } from "../data/cocInvestigatorCatalog";
import { cocRitualCatalog } from "../data/cocRitualCatalog";
import { cocWeaponCatalog } from "../data/cocWeaponCatalog";
import { dndConditions2014 } from "../data/dndConditions2014";
import { dndConditions2024 } from "../data/dndConditions2024";
import type { CardCatalog, CardCatalogEntry } from "../types/cardCatalog";
import { createEmptyPrivateCardLibrary } from "./privateCardLibraryStorage";
import { buildCocCardCatalog } from "./cocCardCatalogSources";
import { buildDndCardCatalog } from "./dndCardCatalogSources";

const normalizeVisibleText = (value: string | undefined): string => (value ?? "")
  .normalize("NFKC")
  .toLocaleLowerCase("en-US")
  .replace(/[‘’]/g, "'")
  .replace(/\s+/g, " ")
  .trim();

const normalizedVisibleKey = (entry: CardCatalogEntry): string => [
  entry.definition.family,
  normalizeVisibleText(entry.definition.content.title),
  normalizeVisibleText(entry.definition.content.subtitle)
].join(":");

const expectNoDuplicateCards = (entries: CardCatalogEntry[]) => {
  expect(new Set(entries.map((entry) => entry.definition.id)).size).toBe(entries.length);
  expect(new Set(entries.map(normalizedVisibleKey)).size).toBe(entries.length);
};

const expectExactSystem = (
  system: "dnd-2014" | "dnd-2024",
  conditionCount: number
): CardCatalog => {
  const catalog = buildDndCardCatalog(system, [], [], createEmptyPrivateCardLibrary(system));
  expect(catalog.entries.length).toBeGreaterThan(700);
  expect(catalog.entries.every((entry) => entry.definition.gameSystemId === system)).toBe(true);
  expectNoDuplicateCards(catalog.entries);
  expect(catalog.sourceCounts.rules).toBeGreaterThan(0);
  expect(catalog.sourceCounts.conditions).toBe(conditionCount);
  expect(catalog.sourceCounts.spells).toBeGreaterThan(300);
  expect(catalog.sourceCounts.monsters).toBeGreaterThan(300);
  expect(catalog.sourceCounts.characters).toBeGreaterThan(300);
  expect(catalog.familyCounts.condition).toBe(conditionCount);
  expect(catalog.sourceCounts.private ?? 0).toBe(0);
  expect(catalog.issues.filter((issue) => issue.message.includes("duplicates an existing visible"))).toHaveLength(0);
  return catalog;
};

const rageMaximums = (catalog: CardCatalog): Set<number | "unlimited"> => new Set(
  catalog.entries
    .filter((entry) => entry.sourceId === "characters" && entry.definition.content.title === "Rage")
    .flatMap((entry) => entry.definition.resources.map((resource) => resource.maximum))
);

describe("unified exact-system Card Catalog sources", () => {
  it("assembles large but isolated D&D 2014 and 2024 catalogs without duplicate visible cards", () => {
    const catalog2014 = expectExactSystem("dnd-2014", dndConditions2014.length);
    const catalog2024 = expectExactSystem("dnd-2024", dndConditions2024.length);
    expect(new Set(catalog2014.entries.map((entry) => entry.definition.gameSystemId))).toEqual(new Set(["dnd-2014"]));
    expect(new Set(catalog2024.entries.map((entry) => entry.definition.gameSystemId))).toEqual(new Set(["dnd-2024"]));
  });

  it("preserves every distinct scaled Rage resource instead of keeping the level-one card", () => {
    const catalog2014 = buildDndCardCatalog("dnd-2014", [], [], createEmptyPrivateCardLibrary("dnd-2014"));
    const catalog2024 = buildDndCardCatalog("dnd-2024", [], [], createEmptyPrivateCardLibrary("dnd-2024"));

    expect(rageMaximums(catalog2014)).toEqual(new Set([2, 3, 4, 5, 6, "unlimited"]));
    expect(rageMaximums(catalog2024)).toEqual(new Set([2, 3, 4, 5, 6]));
  });

  it("collapses identical Character Vault loadout cards into one reusable definition per edition", () => {
    for (const system of ["dnd-2014", "dnd-2024"] as const) {
      const catalog = buildDndCardCatalog(system, [], [], createEmptyPrivateCardLibrary(system));
      const parchment = catalog.entries.filter((entry) => (
        entry.sourceId === "characters"
        && entry.definition.family === "item"
        && entry.definition.content.title === "10 Sheets of Parchment"
      ));
      expect(parchment).toHaveLength(1);
    }
  });

  it("assembles verified and original CoC 7e sources without duplicate visible cards or crossed systems", () => {
    const catalog = buildCocCardCatalog(createEmptyPrivateCardLibrary("coc-7e"));
    expect(catalog.entries).toHaveLength(
      9
      + cocCreatureCatalog.length
      + cocWeaponCatalog.length
      + cocRitualCatalog.length
      + cocInvestigatorCatalog.length
    );
    expect(catalog.entries.every((entry) => entry.definition.gameSystemId === "coc-7e")).toBe(true);
    expectNoDuplicateCards(catalog.entries);
    expect(catalog.sourceCounts["coc-procedures"]).toBe(9);
    expect(catalog.sourceCounts["coc-equipment"]).toBe(cocWeaponCatalog.length);
    expect(catalog.sourceCounts["coc-rituals"]).toBe(cocRitualCatalog.length);
    expect(catalog.sourceCounts["coc-creatures"]).toBe(cocCreatureCatalog.length);
    expect(catalog.sourceCounts["coc-investigators"]).toBe(cocInvestigatorCatalog.length);
    expect(catalog.issues).toHaveLength(0);
  });
});