import { describe, expect, it } from "vitest";
import { validateDiceFormula } from "../utils/rollDice";
import { dmCards } from "./dmCards";
import { sampleCards } from "./sampleCards";

const starterCards = [...sampleCards, ...dmCards];

describe("starter card data", () => {
  it("uses unique IDs and valid dice formulas", () => {
    const ids = starterCards.map((card) => card.id);

    expect(new Set(ids).size).toBe(ids.length);
    starterCards.forEach((card) => {
      expect(card.name.trim()).not.toBe("");
      expect(card.description.trim()).not.toBe("");
      expect(() => validateDiceFormula(card.formula)).not.toThrow();
    });
  });

  it("limits automatic natural 20 and 1 markers to attack cards", () => {
    starterCards.forEach((card) => {
      if (card.critOn !== undefined || card.failOn !== undefined) {
        expect(card.category).toBe("attack");
        expect(card.critOn).toBe(20);
        expect(card.failOn).toBe(1);
      }
    });
  });

  it("keeps the audited example weapon and spell formulas", () => {
    expect(sampleCards.find((card) => card.id === "barb-greataxe-damage")?.formula).toBe(
      "1d12+5"
    );
    expect(sampleCards.find((card) => card.id === "fireball-level-5")?.formula).toBe("10d6");
  });
});
