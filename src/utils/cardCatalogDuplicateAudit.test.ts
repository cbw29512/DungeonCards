import { describe, expect, it } from "vitest";
import { cocWeaponCatalog } from "../data/cocWeaponCatalog";
import type { CardCatalogEntry } from "../types/cardCatalog";
import type { CardDefinition } from "../types/cardPlatform";
import { buildCardCatalog } from "./cardCatalogBuild";
import { adaptCocWeapon } from "./cardPlatformCocWeaponAdapter";

type CardPatch = Omit<Partial<CardDefinition>, "content"> & {
  content?: Partial<CardDefinition["content"]>;
};

const cloneWith = (
  card: CardDefinition,
  patch: CardPatch
): CardDefinition => ({
  ...card,
  ...patch,
  content: {
    ...card.content,
    ...patch.content
  }
});

const visibleKey = (entry: CardCatalogEntry): string => [
  entry.definition.family,
  entry.definition.content.title.normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim(),
  (entry.definition.content.subtitle ?? "").normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim()
].join(":");

describe("Card Catalog duplicate handling", () => {
  it("excludes duplicate IDs from immutable public sources", () => {
    const original = adaptCocWeapon(cocWeaponCatalog[0]!);
    const conflicting = cloneWith(adaptCocWeapon(cocWeaponCatalog[1]!), {
      id: original.id
    });
    const catalog = buildCardCatalog("coc-7e", [{
      id: "coc-equipment",
      label: "Original equipment",
      definitions: [original, conflicting]
    }]);

    expect(catalog.entries).toHaveLength(1);
    expect(catalog.entries[0]?.definition.id).toBe(original.id);
    expect(catalog.issues.some((issue) => issue.message.includes("conflicts with immutable"))).toBe(true);
  });

  it("collapses exact-equivalent immutable definitions without creating a warning", () => {
    const original = adaptCocWeapon(cocWeaponCatalog[0]!);
    const equivalent = cloneWith(original, { id: "legacy-coc:weapon:equivalent-copy" });
    const catalog = buildCardCatalog("coc-7e", [{
      id: "coc-equipment",
      label: "Original equipment",
      definitions: [original, equivalent]
    }]);

    expect(catalog.entries).toHaveLength(1);
    expect(catalog.entries[0]?.definition.id).toBe(original.id);
    expect(catalog.issues).toHaveLength(0);
  });

  it("preserves mechanically different cards and gives visible collisions clear context", () => {
    const original = adaptCocWeapon(cocWeaponCatalog[0]!);
    const differentMechanics = cloneWith(adaptCocWeapon(cocWeaponCatalog[1]!), {
      id: "legacy-coc:weapon:different-mechanics",
      content: {
        title: original.content.title,
        subtitle: original.content.subtitle
      }
    });
    const catalog = buildCardCatalog("coc-7e", [{
      id: "coc-equipment",
      label: "Original equipment",
      definitions: [original, differentMechanics]
    }]);

    expect(catalog.entries).toHaveLength(2);
    expect(new Set(catalog.entries.map(visibleKey)).size).toBe(2);
    expect(catalog.entries.every((entry) => entry.definition.content.subtitle?.includes("Original Equipment"))).toBe(true);
    expect(catalog.issues).toHaveLength(0);
  });

  it("normalizes curly apostrophes, case, and whitespace when identifying exact equivalents", () => {
    const original = cloneWith(adaptCocWeapon(cocWeaponCatalog[0]!), {
      id: "legacy-coc:weapon:keepers-blade-one",
      content: { title: "Keeper’s Blade", subtitle: "Archive Test" }
    });
    const equivalent = cloneWith(original, {
      id: "legacy-coc:weapon:keepers-blade-two",
      content: { title: "  KEEPER'S   BLADE  ", subtitle: " archive   test " }
    });
    const catalog = buildCardCatalog("coc-7e", [{
      id: "coc-equipment",
      label: "Original equipment",
      definitions: [original, equivalent]
    }]);

    expect(catalog.entries).toHaveLength(1);
    expect(catalog.issues).toHaveLength(0);
  });

  it("keeps cards with the same generic title when their visible context differs", () => {
    const first = cloneWith(adaptCocWeapon(cocWeaponCatalog[0]!), {
      id: "legacy-coc:weapon:context-one",
      content: { title: "Field Tool", subtitle: "Archive Researcher" }
    });
    const second = cloneWith(adaptCocWeapon(cocWeaponCatalog[1]!), {
      id: "legacy-coc:weapon:context-two",
      content: { title: "Field Tool", subtitle: "Railway Inspector" }
    });
    const catalog = buildCardCatalog("coc-7e", [{
      id: "coc-equipment",
      label: "Original equipment",
      definitions: [first, second]
    }]);

    expect(catalog.entries).toHaveLength(2);
    expect(catalog.issues).toHaveLength(0);
  });
});