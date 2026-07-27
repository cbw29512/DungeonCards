import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const route = read("src/integration/dmForgeRoute.ts");
const dnd = read("src/utils/dndCardCatalogSources.ts");
const coc = read("src/utils/cocCardCatalogSources.ts");
const query = read("src/utils/cardCatalogQuery.ts");
const workspace = read("src/components/cardPlatform/CardCatalogWorkspace.tsx");
const item = read("src/components/cardPlatform/CardCatalogItem.tsx");
const styles = read("src/styles/card-catalog.css");
const print = read("src/styles/card-catalog-responsive-print.css");

describe("unified exact-system Card Catalog architecture", () => {
  it("keeps independent D&D and CoC catalog routes", () => {
    expect(route).toContain('| "catalog"');
    expect(route).toContain('"catalog", "player"');
    expect(route).toContain('"rules", "catalog", "equipment"');
  });

  it("assembles every required source through Card Platform validation", () => {
    for (const token of ["ruleCardCatalog", "srdSpells", "encounterMonsterCatalog", "generateDndVaultCardLibrary", "homebrewCards", "homebrewMonsters", "privateLibrary.definitions"]) {
      expect(dnd).toContain(token);
    }
    for (const token of ["cocQuickReferenceCards", "cocPreviewWeapon", "cocPreviewSpell", "cocPreviewCreature", "privateLibrary.definitions"]) {
      expect(coc).toContain(token);
    }
    expect(dnd).toContain("buildCardCatalog");
    expect(coc).toContain("buildCardCatalog");
  });

  it("keeps the DOM pagination boundary at 36 cards", () => {
    expect(query).toContain("CARD_CATALOG_PAGE_SIZE = 36");
    expect(query).toContain("entries.slice(start, start + CARD_CATALOG_PAGE_SIZE)");
    expect(workspace).toContain("paginated.entries.map");
    expect(workspace).not.toContain("catalog.entries.map((entry)");
  });

  it("keeps controls and source metadata outside universal cards", () => {
    expect(workspace).toContain("<CardCatalogControls");
    expect(workspace).toContain("<CardCatalogItem");
    expect(item).toContain("card-catalog__origin");
    expect(item).toContain("<CardPlatformDefinitionCard");
    expect(item.indexOf("card-catalog__add")).toBeGreaterThan(item.indexOf("CardPlatformDefinitionCard"));
    expect(styles).not.toMatch(/250px|350px|2\.5in|3\.5in/);
  });

  it("prints only the current page at shared physical dimensions", () => {
    expect(print).toContain("var(--dm-card-print-width)");
    expect(print).toContain(".card-catalog__controls");
    expect(print).toContain("display: none !important");
    expect(print).toContain("grid-template-columns: repeat(3, var(--dm-card-print-width))");
  });
});
