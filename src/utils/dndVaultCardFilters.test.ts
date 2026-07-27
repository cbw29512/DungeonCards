import { describe, expect, it } from "vitest";
import { dndVaultReadyBuilds } from "../data/dndVaultReadyBuilds";
import { generateDndCharacterCardBundle } from "./dndCharacterCardGeneration";
import {
  countDndVaultCardCategories,
  dndVaultCardCategory,
  filterDndVaultCards
} from "./dndVaultCardFilters";

const cleric = dndVaultReadyBuilds.find((profile) => (
  profile.classId === "cleric" && profile.ruleset === "srd-5.2.1-2024" && profile.level === 20
));
if (!cleric) throw new Error("Expected the 2024 level 20 cleric fixture.");
const cards = generateDndCharacterCardBundle(cleric).definitions;

describe("Character Vault card deck filters", () => {
  it("classifies every generated card exactly once", () => {
    const counts = countDndVaultCardCategories(cards);
    expect(counts.all).toBe(cards.length);
    expect(counts.attack + counts.resource + counts.spell + counts.feature + counts.item)
      .toBe(cards.length);
    expect(counts.spell).toBeGreaterThan(0);
    expect(counts.resource).toBeGreaterThan(0);
    expect(cards.every((card) => Boolean(dndVaultCardCategory(card)))).toBe(true);
  });

  it("filters by category and searches titles, actions, tags, and sources", () => {
    const spells = filterDndVaultCards(cards, "spell", "");
    expect(spells.length).toBeGreaterThan(0);
    expect(spells.every((card) => card.family === "spell")).toBe(true);
    const sourceMatches = filterDndVaultCards(cards, "all", "SRD");
    expect(sourceMatches.length).toBeGreaterThan(0);
    const attackMatches = filterDndVaultCards(cards, "attack", "attack");
    expect(attackMatches.length).toBeGreaterThan(0);
    expect(attackMatches.every((card) => card.content.tags.includes("attack"))).toBe(true);
  });

  it("returns an empty result for unmatched terms", () => {
    expect(filterDndVaultCards(cards, "all", "not-a-real-card-name-xyz")).toEqual([]);
  });
});
