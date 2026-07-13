import { describe, expect, it } from "vitest";
import type { RuleRollPart, RulesetId } from "../types/ruleCards";
import { validateDiceFormula } from "../utils/rollDice";
import { ruleCardCatalog } from "./ruleCardCatalog";

const rulesets: RulesetId[] = ["srd-5.1-2014", "srd-5.2.1-2024"];
const masteryNames = ["Cleave", "Graze", "Nick", "Push", "Sap", "Slow", "Topple", "Vex"];
const hasTag = (tags: string[], tag: string) => tags.includes(tag);

const validatePart = (part: RuleRollPart) => {
  expect(() => validateDiceFormula(part.formula)).not.toThrow();
  part.choices?.forEach((choice) => {
    expect(() => validateDiceFormula(choice.formula)).not.toThrow();
  });
};

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

  it("validates every primary and secondary formula", () => {
    ruleCardCatalog.forEach((card) => {
      Object.values(card.variants).forEach((variant) => {
        variant?.modes.forEach((mode) => {
          validatePart(mode);
          if (mode.secondaryRoll) validatePart(mode.secondaryRoll);
        });
      });
    });
  });

  it("limits automatic natural outcomes to attack parts", () => {
    ruleCardCatalog.forEach((card) => {
      Object.values(card.variants).forEach((variant) => {
        variant?.modes.forEach((mode) => {
          [mode, mode.secondaryRoll].filter(Boolean).forEach((part) => {
            if (part?.naturalRollRule === "attack") {
              expect(part.kind).toBe("attack");
              expect(part.formula).toMatch(/^1d20[+-]\d+$/);
            }
          });
        });
      });
    });
  });

  it("provides separate core attack save and ability check cards", () => {
    expect(ruleCardCatalog.find((card) => card.id === "core-attack-roll")?.kind).toBe("attack");
    expect(ruleCardCatalog.find((card) => card.id === "core-saving-throw")?.kind).toBe("saving-throw");
    expect(ruleCardCatalog.find((card) => card.id === "core-ability-check")?.kind).toBe("ability-check");
  });

  it("contains complete standalone weapon attack tables", () => {
    const attacks = ruleCardCatalog.filter((card) =>
      card.kind === "attack"
      && Object.values(card.variants).some((variant) => variant && hasTag(variant.tags, "weapon"))
    );
    const oldAttacks = attacks.filter((card) => card.variants["srd-5.1-2014"]);
    const newAttacks = attacks.filter((card) => card.variants["srd-5.2.1-2024"]);

    expect(oldAttacks).toHaveLength(37);
    expect(newAttacks).toHaveLength(38);
    expect(attacks.find((card) => card.id === "net")?.variants["srd-5.2.1-2024"]).toBeUndefined();
    expect(attacks.find((card) => card.id === "musket-attack")?.variants["srd-5.1-2014"]).toBeUndefined();
  });

  it("keeps weapon damage cards free of attack modes", () => {
    ruleCardCatalog
      .filter((card) => card.kind === "weapon-damage")
      .forEach((card) => Object.values(card.variants).forEach((variant) => {
        expect(variant?.modes.every((mode) => mode.kind === "damage")).toBe(true);
      }));
  });

  it("preserves 22 original spell effect families", () => {
    const effects = ruleCardCatalog.filter((card) =>
      ["spell", "spell-damage", "spell-healing"].includes(card.kind)
      && Object.values(card.variants).some((variant) => variant && hasTag(variant.tags, "spell"))
    );

    expect(effects).toHaveLength(22);
    effects.forEach((spell) => {
      expect(spell.variants["srd-5.1-2014"]).toBeDefined();
      expect(spell.variants["srd-5.2.1-2024"]).toBeDefined();
      Object.values(spell.variants).forEach((variant) => {
        expect(variant?.modes.some((mode) => mode.kind === "attack")).toBe(false);
      });
    });
  });

  it("keeps changed cantrip attack cards edition-specific", () => {
    const poison = ruleCardCatalog.find((card) => card.id === "poison-spray-attack");
    const chill = ruleCardCatalog.find((card) => card.id === "chill-touch-attack");

    expect(poison?.variants["srd-5.1-2014"]).toBeUndefined();
    expect(poison?.variants["srd-5.2.1-2024"]).toBeDefined();
    expect(chill?.variants["srd-5.1-2014"]?.summary).toContain("120 ft.");
    expect(chill?.variants["srd-5.2.1-2024"]?.summary).toContain("Touch");
  });

  it("makes every quick roll an attack plus potential damage", () => {
    const quickCards = ruleCardCatalog.filter((card) => card.kind === "quick-roll");
    expect(quickCards.length).toBeGreaterThan(0);

    quickCards.forEach((card) => Object.values(card.variants).forEach((variant) => {
      variant?.modes.forEach((mode) => {
        expect(mode.kind).toBe("attack");
        expect(mode.secondaryRoll?.kind).toBe("damage");
        expect(mode.secondaryRoll?.naturalRollRule ?? "none").toBe("none");
      });
    }));
  });

  it("keeps every 2024 weapon mastery out of 2014 variants", () => {
    ruleCardCatalog
      .filter((card) => Object.values(card.variants).some((variant) => variant && hasTag(variant.tags, "weapon")))
      .forEach((card) => {
        const oldText = card.variants["srd-5.1-2014"]?.summary ?? "";
        const newText = card.variants["srd-5.2.1-2024"]?.summary;
        masteryNames.forEach((mastery) => expect(oldText).not.toContain(mastery));
        if (newText) expect(masteryNames.some((mastery) => newText.includes(mastery))).toBe(true);
      });
  });
});