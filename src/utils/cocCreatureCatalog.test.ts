import { describe, expect, it } from "vitest";
import {
  cocCreatureCatalog,
  cocCreatureKinds,
  cocCreatureThreatLevels
} from "../data/cocCreatureCatalog";
import { getCocRuleSource } from "../data/cocRuleSources";
import { adaptCocCreature } from "./cardPlatformCocCreatureAdapter";
import { validateCardDefinition } from "./cardPlatformValidation";

describe("Percentile Horror original creature library", () => {
  it("ships a substantial unique public-safe first-party roster", () => {
    expect(cocCreatureCatalog).toHaveLength(24);
    expect(new Set(cocCreatureCatalog.map((creature) => creature.id)).size).toBe(cocCreatureCatalog.length);
    expect(new Set(cocCreatureCatalog.map((creature) => creature.name)).size).toBe(cocCreatureCatalog.length);
    expect(new Set(cocCreatureCatalog.map((creature) => creature.kind))).toEqual(new Set(cocCreatureKinds));
    expect(new Set(cocCreatureCatalog.map((creature) => creature.threat))).toEqual(new Set(cocCreatureThreatLevels));
  });

  it("keeps every dossier complete enough for live Keeper use", () => {
    for (const creature of cocCreatureCatalog) {
      expect(creature.id).toMatch(/^coc-original-/);
      expect(creature.description.length).toBeGreaterThan(60);
      expect(creature.environments.length).toBeGreaterThan(0);
      expect(creature.traits.length).toBeGreaterThanOrEqual(3);
      expect(creature.attacks.length).toBeGreaterThanOrEqual(2);
      expect(creature.hitPoints).toBeGreaterThan(0);
      expect(creature.magicPoints).toBeGreaterThanOrEqual(0);
      expect(creature.dodge).toBeGreaterThanOrEqual(0);
      expect(creature.dodge).toBeLessThanOrEqual(100);
      expect(creature.sanityLossFormula).toMatch(/^\d+d\d+(?:[+-]\d+)?$/);
      for (const value of Object.values(creature.characteristics)) {
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThanOrEqual(200);
      }
      for (const attack of creature.attacks) {
        expect(attack.skill).toBeGreaterThan(0);
        expect(attack.skill).toBeLessThanOrEqual(100);
        expect(attack.damageFormula).toMatch(/^\d+d\d+(?:(?:\+|-)\d+d\d+|(?:\+|-)\d+)*$/);
        expect(attack.notes.length).toBeGreaterThan(10);
      }
    }
  });

  it("adapts every public creature into a valid executable Card Platform definition", () => {
    const source = getCocRuleSource("coc-original-creature-preview");
    for (const creature of cocCreatureCatalog) {
      const card = adaptCocCreature(creature, { source });
      expect(card).toMatchObject({
        gameSystemId: "coc-7e",
        family: "creature",
        visibility: "game-master-only",
        source: {
          kind: "original",
          publicDistributionAllowed: true
        }
      });
      expect(card.actions.length).toBe(creature.attacks.length * 2 + 2);
      expect(validateCardDefinition(card)).toEqual([]);
    }
  });
});
