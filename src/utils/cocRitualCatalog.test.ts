import { describe, expect, it } from "vitest";
import {
  cocRitualCatalog,
  cocRitualKinds,
  cocRitualRiskLevels
} from "../data/cocRitualCatalog";
import { adaptCocSpell } from "./cardPlatformCocSpellAdapter";
import { validateCardDefinition } from "./cardPlatformValidation";

const diceFormula = /^\d+d\d+(?:(?:\+|-)\d+)?$/;

describe("Percentile Horror original ritual library", () => {
  it("ships a substantial unique roster across every family and risk tier", () => {
    expect(cocRitualCatalog).toHaveLength(24);
    expect(new Set(cocRitualCatalog.map((ritual) => ritual.id)).size).toBe(cocRitualCatalog.length);
    expect(new Set(cocRitualCatalog.map((ritual) => ritual.name)).size).toBe(cocRitualCatalog.length);
    expect(new Set(cocRitualCatalog.map((ritual) => ritual.kind))).toEqual(new Set(cocRitualKinds));
    expect(new Set(cocRitualCatalog.map((ritual) => ritual.risk))).toEqual(new Set(cocRitualRiskLevels));
  });

  it("keeps every ritual complete enough for live Keeper use", () => {
    for (const ritual of cocRitualCatalog) {
      expect(ritual.id).toMatch(/^coc-original-/);
      expect(ritual.contexts.length).toBeGreaterThanOrEqual(3);
      expect(ritual.castingTime.length).toBeGreaterThan(3);
      expect(ritual.magicPointCost).toBeGreaterThan(0);
      expect(ritual.magicPointCost).toBeLessThanOrEqual(12);
      expect(ritual.sanityCostFormula).toMatch(diceFormula);
      expect(ritual.defaultCastingSkill).toBeGreaterThan(0);
      expect(ritual.defaultCastingSkill).toBeLessThanOrEqual(100);
      expect(["regular", "hard", "extreme"]).toContain(ritual.difficulty);
      expect(ritual.range.length).toBeGreaterThan(3);
      expect(ritual.durationFormula).toMatch(diceFormula);
      expect(["rounds", "minutes", "hours", "days"]).toContain(ritual.durationUnit);
      expect(ritual.requirements.length).toBeGreaterThanOrEqual(2);
      expect(ritual.summary.length).toBeGreaterThan(70);
      expect(ritual.effect.length).toBeGreaterThan(90);
      expect(ritual.failure.length).toBeGreaterThan(80);
    }
  });

  it("keeps risk mechanically ordered without forcing identical records", () => {
    const averages = Object.fromEntries(cocRitualRiskLevels.map((risk) => {
      const records = cocRitualCatalog.filter((ritual) => ritual.risk === risk);
      return [risk, records.reduce((sum, ritual) => sum + ritual.magicPointCost, 0) / records.length];
    }));
    expect(averages.low).toBeLessThan(averages.moderate);
    expect(averages.moderate).toBeLessThan(averages.severe);
    expect(averages.severe).toBeLessThan(averages.catastrophic);
  });

  it("adapts every ritual into a valid executable Card Platform definition", () => {
    for (const ritual of cocRitualCatalog) {
      const card = adaptCocSpell(ritual);
      expect(card).toMatchObject({
        gameSystemId: "coc-7e",
        family: "ritual",
        visibility: "game-master-only",
        source: {
          kind: "original",
          publicDistributionAllowed: true
        }
      });
      expect(card.actions).toHaveLength(4);
      expect(card.actions).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: "casting-check", percentileDifficulty: ritual.difficulty }),
        expect.objectContaining({ id: "sanity-cost", formula: ritual.sanityCostFormula }),
        expect.objectContaining({ id: "duration", formula: ritual.durationFormula })
      ]));
      expect(validateCardDefinition(card)).toEqual([]);
    }
  });
});
