import { describe, expect, it } from "vitest";
import { cocWeaponCatalog } from "../data/cocWeaponCatalog";
import type { CardDefinition } from "../types/cardPlatform";
import { buildCardCatalog } from "./cardCatalogBuild";
import { adaptCocWeapon } from "./cardPlatformCocWeaponAdapter";

const cloneWith = (
  card: CardDefinition,
  patch: Partial<CardDefinition> & { content?: Partial<CardDefinition["content"]> }
): CardDefinition => ({
  ...card,
  ...patch,
  content: {
    ...card.content,
    ...patch.content
  }
});

describe("Card Catalog duplicate rejection", () => {
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

  it("excludes duplicate visible identities within the same card family", () => {
    const original = adaptCocWeapon(cocWeaponCatalog[0]!);
    const duplicateVisibleCard = cloneWith(adaptCocWeapon(cocWeaponCatalog[1]!), {
      id: "legacy-coc:weapon:duplicate-visible-test",
      content: {
        title: original.content.title,
        subtitle: original.content.subtitle
      }
    });
    const catalog = buildCardCatalog("coc-7e", [{
      id: "coc-equipment",
      label: "Original equipment",
      definitions: [original, duplicateVisibleCard]
    }]);

    expect(catalog.entries).toHaveLength(1);
    expect(catalog.entries[0]?.definition.content.title).toBe(original.content.title);
    expect(catalog.issues.some((issue) => issue.message.includes("duplicates an existing visible weapon card"))).toBe(true);
  });

  it("normalizes curly apostrophes, case, and whitespace before comparing visible identities", () => {
    const original = cloneWith(adaptCocWeapon(cocWeaponCatalog[0]!), {
      id: "legacy-coc:weapon:keepers-blade-one",
      content: { title: "Keeper’s Blade", subtitle: "Archive Test" }
    });
    const duplicateVisibleCard = cloneWith(adaptCocWeapon(cocWeaponCatalog[1]!), {
      id: "legacy-coc:weapon:keepers-blade-two",
      content: { title: "  KEEPER'S   BLADE  ", subtitle: " archive   test " }
    });
    const catalog = buildCardCatalog("coc-7e", [{
      id: "coc-equipment",
      label: "Original equipment",
      definitions: [original, duplicateVisibleCard]
    }]);

    expect(catalog.entries).toHaveLength(1);
    expect(catalog.issues).toHaveLength(1);
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
