import { describe, expect, it } from "vitest";
import { playerRuleCards } from "../data/ruleCardCatalog";
import type { RuleRollMode, RuleRollPart, RulesetId } from "../types/ruleCards";
import {
  resolveRuleFormula,
  resolveRuleTable,
  resolveTableResult
} from "./ruleCardFormula";

const getMode = (
  cardId: string,
  ruleset: RulesetId,
  modeId = "effect"
): RuleRollMode => {
  const card = playerRuleCards.find((candidate) => candidate.id === cardId);
  const variant = card?.variants[ruleset];
  const mode = variant?.modes.find((candidate) => candidate.id === modeId);

  if (!mode) {
    throw new Error(`Missing ${cardId}/${ruleset}/${modeId} test mode.`);
  }

  return mode;
};

const formula = (
  cardId: string,
  ruleset: RulesetId,
  slotLevel: number,
  characterLevel = 1,
  modifier = 3,
  modeId = "effect"
): string => resolveRuleFormula(
  getMode(cardId, ruleset, modeId),
  slotLevel,
  characterLevel,
  modifier
);

const resolvePart = (part: RuleRollPart, slotLevel: number): string =>
  resolveRuleFormula(
    part,
    slotLevel,
    1,
    part.modifierControl?.defaultValue ?? 0,
    part.choices?.[0]?.id
  );

describe("rule card formula scaling", () => {
  it("scales Fireball one d6 per higher spell slot", () => {
    expect(formula("fireball", "srd-5.1-2014", 3)).toBe("8d6");
    expect(formula("fireball", "srd-5.1-2014", 4)).toBe("9d6");
    expect(formula("fireball", "srd-5.2.1-2024", 5)).toBe("10d6");
  });

  it("keeps 2014 and 2024 Cure Wounds scaling separate", () => {
    expect(formula("cure-wounds", "srd-5.1-2014", 3, 1, 4)).toBe("3d8+4");
    expect(formula("cure-wounds", "srd-5.2.1-2024", 3, 1, 4)).toBe("6d8+4");
  });

  it("scales added area spells at their documented rates", () => {
    expect(formula("burning-hands", "srd-5.1-2014", 4)).toBe("6d6");
    expect(formula("shatter", "srd-5.2.1-2024", 5)).toBe("6d8");
    expect(formula("lightning-bolt", "srd-5.2.1-2024", 7)).toBe("12d6");
    expect(formula("cone-of-cold", "srd-5.1-2014", 9)).toBe("12d8");
  });

  it("keeps Call Lightning's storm bonus while upcasting", () => {
    expect(formula("call-lightning", "srd-5.1-2014", 5, 1, 0, "normal")).toBe("5d10");
    expect(formula("call-lightning", "srd-5.2.1-2024", 5, 1, 0, "storm")).toBe("6d10");
  });

  it("scales Magic Missile darts and fixed dart bonuses", () => {
    expect(formula("magic-missile", "srd-5.1-2014", 1)).toBe("3d4+3");
    expect(formula("magic-missile", "srd-5.2.1-2024", 4)).toBe("6d4+6");
  });

  it("scales cantrips by character level rather than slot level", () => {
    expect(formula("fire-bolt", "srd-5.2.1-2024", 1, 1)).toBe("1d10");
    expect(formula("ray-of-frost", "srd-5.1-2014", 9, 5)).toBe("2d8");
    expect(formula("sacred-flame", "srd-5.2.1-2024", 1, 11)).toBe("3d8");
    expect(formula("poison-spray", "srd-5.2.1-2024", 1, 17)).toBe("4d12");
  });

  it("keeps Chill Touch damage dice edition-specific", () => {
    expect(formula("chill-touch", "srd-5.1-2014", 1, 11)).toBe("3d8");
    expect(formula("chill-touch", "srd-5.2.1-2024", 1, 11)).toBe("3d10");
  });

  it("scales Eldritch Blast beams while retaining one-beam damage", () => {
    expect(formula("eldritch-blast", "srd-5.1-2014", 1, 17, 0, "all-beams")).toBe("4d10");
    expect(formula("eldritch-blast", "srd-5.2.1-2024", 1, 17, 0, "per-beam")).toBe("1d10");
  });

  it("keeps Blink's random check edition-specific", () => {
    const oldMode = getMode("blink", "srd-5.1-2014", "blink-check");
    const newMode = getMode("blink", "srd-5.2.1-2024", "blink-check");

    expect(oldMode.formula).toBe("1d20");
    expect(newMode.formula).toBe("1d6");
    expect(resolveTableResult(resolveRuleTable(oldMode), 11)).toContain("Vanish");
    expect(resolveTableResult(resolveRuleTable(newMode), 4)).toContain("Vanish");
  });

  it("changes every slot-scaled spell formula at the next valid slot", () => {
    let scalableParts = 0;

    playerRuleCards.forEach((card) => {
      Object.values(card.variants).forEach((variant) => {
        variant?.modes.forEach((mode) => {
          [mode, mode.secondaryRoll].filter(Boolean).forEach((part) => {
            if (part?.scaling?.kind !== "slot-dice") return;
            scalableParts += 1;
            const baseLevel = part.scaling.baseLevel;
            const nextLevel = Math.min(part.scaling.maxLevel, baseLevel + 1);
            expect(resolvePart(part, nextLevel), `${card.name} ${mode.label}`).not.toBe(
              resolvePart(part, baseLevel)
            );
          });
        });
      });
    });

    expect(scalableParts).toBeGreaterThan(10);
  });
});
