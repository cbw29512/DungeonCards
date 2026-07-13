import { describe, expect, it } from "vitest";
import { ruleCardCatalog } from "./ruleCardCatalog";
import type { RulesetId } from "../types/ruleCards";
import { validateDiceFormula } from "../utils/rollDice";

const rulesets: RulesetId[] = ["srd-5.1-2014", "srd-5.2.1-2024"];

describe("rules card catalog", () => {
  it("uses unique family IDs and source references", () => {
    const ids = ruleCardCatalog.map((card) => card.id);

    expect(new Set(ids).size).toBe(ids.length);
    ruleCardCatalog.forEach((card) => {
      expect(card.name.trim()).not.toBe("");
      expect(Object.keys(card.variants).length).toBeGreaterThan(0);

      rulesets.forEach((ruleset) => {
        const variant = card.variants[ruleset];

        if (variant) {
          expect(variant.ruleset).toBe(ruleset);
          expect(variant.source).toBe("srd");
          expect(variant.sourceReference).toContain(
            ruleset === "srd-5.1-2014" ? "SRD 5.1" : "SRD 5.2.1"
          );
        }
      });
    });
  });

  it("validates every base and choice formula", () => {
    ruleCardCatalog.forEach((card) => {
      Object.values(card.variants).forEach((variant) => {
        variant?.modes.forEach((mode) => {
          expect(() => validateDiceFormula(mode.formula)).not.toThrow();
          mode.choices?.forEach((choice) => {
            expect(() => validateDiceFormula(choice.formula)).not.toThrow();
          });
        });
      });
    });
  });

  it("limits automatic natural outcomes to attack modes", () => {
    ruleCardCatalog.forEach((card) => {
      Object.values(card.variants).forEach((variant) => {
        variant?.modes.forEach((mode) => {
          if (mode.naturalRollRule === "attack") {
            expect(mode.kind).toBe("attack");
            expect(mode.formula).toMatch(/^1d20[+-]\d+$/);
          }
        });
      });
    });
  });

  it("keeps 2024 weapon mastery text out of 2014 variants", () => {
    const masteryNames = ["Cleave", "Nick", "Sap", "Slow"];

    ruleCardCatalog
      .filter((card) => card.kind === "weapon")
      .forEach((card) => {
        const oldText = card.variants["srd-5.1-2014"]?.summary ?? "";
        const newText = card.variants["srd-5.2.1-2024"]?.summary ?? "";

        masteryNames.forEach((mastery) => expect(oldText).not.toContain(mastery));
        expect(masteryNames.some((mastery) => newText.includes(mastery))).toBe(true);
      });
  });
});