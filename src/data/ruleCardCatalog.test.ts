import { describe, expect, it } from "vitest";
import type { RulesetId } from "../types/ruleCards";
import { validateDiceFormula } from "../utils/rollDice";
import { ruleCardCatalog } from "./ruleCardCatalog";

const rulesets: RulesetId[] = ["srd-5.1-2014", "srd-5.2.1-2024"];
const masteryNames = ["Cleave", "Graze", "Nick", "Push", "Sap", "Slow", "Topple", "Vex"];

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

  it("contains the complete SRD weapon tables for both rulesets", () => {
    const weapons = ruleCardCatalog.filter((card) => card.kind === "weapon");
    const oldWeapons = weapons.filter((card) => card.variants["srd-5.1-2014"]);
    const newWeapons = weapons.filter((card) => card.variants["srd-5.2.1-2024"]);

    expect(oldWeapons).toHaveLength(37);
    expect(newWeapons).toHaveLength(38);
    expect(weapons.find((card) => card.id === "net")?.variants["srd-5.2.1-2024"]).toBeUndefined();
    expect(weapons.find((card) => card.id === "musket")?.variants["srd-5.1-2014"]).toBeUndefined();
    expect(weapons.find((card) => card.id === "pistol")?.variants["srd-5.1-2014"]).toBeUndefined();
  });

  it("contains 22 audited spell families in both rulesets", () => {
    const spells = ruleCardCatalog.filter((card) => card.kind === "spell");

    expect(spells).toHaveLength(22);
    spells.forEach((spell) => {
      expect(spell.variants["srd-5.1-2014"]).toBeDefined();
      expect(spell.variants["srd-5.2.1-2024"]).toBeDefined();
    });
  });

  it("keeps changed cantrip attack rules edition-specific", () => {
    const poison = ruleCardCatalog.find((card) => card.id === "poison-spray");
    const chill = ruleCardCatalog.find((card) => card.id === "chill-touch");
    const oldPoisonModes = poison?.variants["srd-5.1-2014"]?.modes ?? [];
    const newPoisonModes = poison?.variants["srd-5.2.1-2024"]?.modes ?? [];

    expect(oldPoisonModes.some((mode) => mode.kind === "attack")).toBe(false);
    expect(newPoisonModes.some((mode) => mode.kind === "attack")).toBe(true);
    expect(chill?.variants["srd-5.1-2014"]?.summary).toContain("120 ft.");
    expect(chill?.variants["srd-5.2.1-2024"]?.summary).toContain("Touch");
  });

  it("keeps Bag of Tricks tables complete and shared across SRDs", () => {
    const card = ruleCardCatalog.find((candidate) => candidate.id === "bag-of-tricks");
    const oldChoices = card?.variants["srd-5.1-2014"]?.modes[0].choices;
    const newChoices = card?.variants["srd-5.2.1-2024"]?.modes[0].choices;

    expect(oldChoices).toHaveLength(3);
    oldChoices?.forEach((choice) => expect(choice.table).toHaveLength(8));
    expect(newChoices).toEqual(oldChoices);
    expect(oldChoices?.[0]?.table?.[7]?.result).toBe("Giant Elk");
    expect(oldChoices?.[2]?.table?.[7]?.result).toBe("Tiger");
  });

  it("keeps the random resistance table identical across both SRDs", () => {
    const card = ruleCardCatalog.find((candidate) => candidate.id === "armor-of-resistance");
    const oldTable = card?.variants["srd-5.1-2014"]?.modes[0].choices?.[0].table;
    const newTable = card?.variants["srd-5.2.1-2024"]?.modes[0].choices?.[0].table;

    expect(oldTable).toHaveLength(10);
    expect(newTable).toEqual(oldTable);
    expect(oldTable?.[0]?.result).toBe("Acid");
    expect(oldTable?.[9]?.result).toBe("Thunder");
  });

  it("keeps every 2024 mastery out of 2014 variants", () => {
    ruleCardCatalog
      .filter((card) => card.kind === "weapon")
      .forEach((card) => {
        const oldText = card.variants["srd-5.1-2014"]?.summary ?? "";
        const newText = card.variants["srd-5.2.1-2024"]?.summary;

        masteryNames.forEach((mastery) => expect(oldText).not.toContain(mastery));
        if (newText) expect(masteryNames.some((mastery) => newText.includes(mastery))).toBe(true);
      });
  });
});