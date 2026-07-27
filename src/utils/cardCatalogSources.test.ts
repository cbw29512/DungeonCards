import { describe, expect, it } from "vitest";
import { createEmptyPrivateCardLibrary } from "./privateCardLibraryStorage";
import { buildCocCardCatalog } from "./cocCardCatalogSources";
import { buildDndCardCatalog } from "./dndCardCatalogSources";

const expectExactSystem = (system: "dnd-2014" | "dnd-2024") => {
  const catalog = buildDndCardCatalog(system, [], [], createEmptyPrivateCardLibrary(system));
  expect(catalog.entries.length).toBeGreaterThan(700);
  expect(catalog.entries.every((entry) => entry.definition.gameSystemId === system)).toBe(true);
  expect(catalog.sourceCounts.rules).toBeGreaterThan(0);
  expect(catalog.sourceCounts.spells).toBeGreaterThan(300);
  expect(catalog.sourceCounts.monsters).toBeGreaterThan(300);
  expect(catalog.sourceCounts.characters).toBeGreaterThan(300);
  expect(catalog.sourceCounts.private ?? 0).toBe(0);
  return catalog;
};

describe("unified exact-system Card Catalog sources", () => {
  it("assembles large but isolated D&D 2014 and 2024 catalogs", () => {
    const catalog2014 = expectExactSystem("dnd-2014");
    const catalog2024 = expectExactSystem("dnd-2024");
    expect(new Set(catalog2014.entries.map((entry) => entry.definition.gameSystemId))).toEqual(new Set(["dnd-2014"]));
    expect(new Set(catalog2024.entries.map((entry) => entry.definition.gameSystemId))).toEqual(new Set(["dnd-2024"]));
  });

  it("assembles verified and original CoC 7e sources without crossing systems", () => {
    const catalog = buildCocCardCatalog(createEmptyPrivateCardLibrary("coc-7e"));
    expect(catalog.entries).toHaveLength(12);
    expect(catalog.entries.every((entry) => entry.definition.gameSystemId === "coc-7e")).toBe(true);
    expect(catalog.sourceCounts["coc-procedures"]).toBe(9);
    expect(catalog.sourceCounts["coc-equipment"]).toBe(1);
    expect(catalog.sourceCounts["coc-rituals"]).toBe(1);
    expect(catalog.sourceCounts["coc-creatures"]).toBe(1);
    expect(catalog.issues).toHaveLength(0);
  });
});
