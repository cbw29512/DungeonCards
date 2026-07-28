import { describe, expect, it } from "vitest";
import { dndVaultReadyBuilds } from "../data/dndVaultReadyBuilds";
import { gameSystemIdForRuleset } from "./cardPlatformGameSystem";
import { generateDndCharacterCardBundle } from "./dndCharacterCardGeneration";

describe("Character Vault Card Platform generation", () => {
  it("generates a valid exact-edition deck for every Vault Ready build", () => {
    expect(dndVaultReadyBuilds).toHaveLength(320);
    const allIds: string[] = [];
    let generatedCount = 0;
    for (const profile of dndVaultReadyBuilds) {
      const before = JSON.stringify(profile);
      const bundle = generateDndCharacterCardBundle(profile);
      expect(JSON.stringify(profile)).toBe(before);
      expect(bundle.buildId).toBe(profile.id);
      expect(bundle.gameSystemId).toBe(gameSystemIdForRuleset(profile.ruleset));
      expect(bundle.definitions.length).toBeGreaterThan(0);
      expect(bundle.deck.kind).toBe("character");
      expect(bundle.deck.gameSystemId).toBe(bundle.gameSystemId);
      expect(bundle.deck.cardDefinitionIds).toEqual(bundle.definitions.map((card) => card.id));
      expect(bundle.definitions.every((card) => card.gameSystemId === bundle.gameSystemId)).toBe(true);
      expect(bundle.definitions.every((card) => card.print.sizeId === "poker-2.5x3.5")).toBe(true);
      allIds.push(...bundle.deck.cardDefinitionIds);
      generatedCount += bundle.definitions.length;
    }
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(generatedCount).toBeGreaterThan(1_000);
  });

  it("calculates attack rolls and keeps the output deterministic", () => {
    const fighter = dndVaultReadyBuilds.find((profile) => (
      profile.classId === "fighter" && profile.ruleset === "srd-5.2.1-2024" && profile.level === 20
    ));
    expect(fighter).toBeDefined();
    const first = generateDndCharacterCardBundle(fighter!);
    const second = generateDndCharacterCardBundle(fighter!);
    expect(second).toEqual(first);
    const attack = first.definitions.find((card) => card.content.tags.includes("attack"));
    expect(attack).toBeDefined();
    expect(attack?.family).toBe("character-action");
    expect(attack?.actions).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "attack-roll", rollSystem: "d20", formula: expect.stringMatching(/^d20[+-]\d+$/) }),
      expect.objectContaining({ id: "damage-roll", rollSystem: "dice-formula" })
    ]));
  });

  it("links cleric spell cards to the exact SRD catalog and tracks slots", () => {
    const cleric = dndVaultReadyBuilds.find((profile) => (
      profile.classId === "cleric" && profile.ruleset === "srd-5.2.1-2024" && profile.level === 20
    ));
    expect(cleric).toBeDefined();
    const bundle = generateDndCharacterCardBundle(cleric!);
    const spells = bundle.definitions.filter((card) => card.family === "spell");
    const slots = bundle.definitions.filter((card) => card.content.tags.includes("spell-slot"));
    expect(spells.length).toBeGreaterThan(0);
    expect(slots.length).toBeGreaterThan(0);
    expect(spells.some((card) => (
      card.source.kind === "srd"
      && card.source.edition === "srd-5.2.1-2024"
      && typeof card.source.page === "number"
    ))).toBe(true);
    expect(slots.every((card) => card.resources[0]?.refresh === "long-rest")).toBe(true);
  });

  it("links 2024 Paladin smite and steed cards to exact SRD records", () => {
    const paladin = dndVaultReadyBuilds.find((profile) => (
      profile.classId === "paladin" && profile.ruleset === "srd-5.2.1-2024" && profile.level === 5
    ));
    expect(paladin).toBeDefined();
    const spells = generateDndCharacterCardBundle(paladin!).definitions.filter((card) => card.family === "spell");
    for (const title of ["Divine Smite", "Find Steed"]) {
      const spell = spells.find((card) => card.content.title === title);
      expect(spell).toBeDefined();
      expect(spell?.source).toEqual(expect.objectContaining({
        kind: "srd",
        edition: "srd-5.2.1-2024",
        page: expect.any(Number)
      }));
    }
  });

  it("creates item cards with independent charges or consumable uses", () => {
    const bundles = dndVaultReadyBuilds
      .filter((profile) => profile.level >= 10)
      .map(generateDndCharacterCardBundle);
    const itemCards = bundles.flatMap((bundle) => bundle.definitions).filter((card) => (
      card.content.tags.includes("magic-item")
    ));
    expect(itemCards.length).toBeGreaterThan(0);
    expect(itemCards.some((card) => card.resources.some((resource) => (
      resource.id === "charges" || resource.id === "uses"
    )))).toBe(true);
  });
});
