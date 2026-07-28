import { describe, expect, it } from "vitest";
import { cocWeaponCatalog } from "../data/cocWeaponCatalog";
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

const catalogFor = (definitions: CardDefinition[]) => buildCardCatalog("coc-7e", [{
  id: "coc-equipment",
  label: "Original equipment",
  definitions
}]);

describe("Card Catalog duplicate rejection", () => {
  it("excludes duplicate IDs from immutable public sources", () => {
    const original = adaptCocWeapon(cocWeaponCatalog[0]!);
    const conflicting = cloneWith(adaptCocWeapon(cocWeaponCatalog[1]!), {
      id: original.id
    });
    const catalog = catalogFor([original, conflicting]);

    expect(catalog.entries).toHaveLength(1);
    expect(catalog.entries[0]?.definition.id).toBe(original.id);
    expect(catalog.issues.some((issue) => issue.message.includes("conflicts with immutable"))).toBe(true);
  });

  it("coalesces mechanically identical definitions even when IDs and visible punctuation differ", () => {
    const original = cloneWith(adaptCocWeapon(cocWeaponCatalog[0]!), {
      id: "legacy-coc:weapon:keepers-blade-one",
      content: { title: "Keeper’s Blade", subtitle: "Archive Test" }
    });
    const exactDuplicate = cloneWith(original, {
      id: "legacy-coc:weapon:keepers-blade-two",
      content: { title: "  KEEPER'S   BLADE  ", subtitle: " archive   test " }
    });
    const catalog = catalogFor([original, exactDuplicate]);

    expect(catalog.entries).toHaveLength(1);
    expect(catalog.issues).toHaveLength(0);
  });

  it("keeps the same visible card when its roll target changes", () => {
    const original = adaptCocWeapon(cocWeaponCatalog[0]!);
    const scaled = cloneWith(original, {
      id: "legacy-coc:weapon:scaled-attack",
      actions: original.actions.map((action) => action.kind === "roll" && action.id === "attack-check"
        ? { ...action, percentileTarget: (action.percentileTarget ?? 20) + 20 }
        : action)
    });
    const catalog = catalogFor([original, scaled]);

    expect(catalog.entries).toHaveLength(2);
    expect(catalog.issues).toHaveLength(0);
  });

  it("keeps the same visible resource card when its maximum changes by level", () => {
    const original = adaptCocWeapon(cocWeaponCatalog.find((weapon) => weapon.capacity > 0)!);
    const scaled = cloneWith(original, {
      id: "legacy-coc:weapon:scaled-resource",
      resources: original.resources.map((resource) => ({
        ...resource,
        maximum: typeof resource.maximum === "number" ? resource.maximum + 1 : resource.maximum,
        initial: typeof resource.initial === "number" ? resource.initial + 1 : resource.initial
      }))
    });
    const catalog = catalogFor([original, scaled]);

    expect(catalog.entries).toHaveLength(2);
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
    const catalog = catalogFor([first, second]);

    expect(catalog.entries).toHaveLength(2);
    expect(catalog.issues).toHaveLength(0);
  });
});