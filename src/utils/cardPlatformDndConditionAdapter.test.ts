import { describe, expect, it } from "vitest";
import { dndConditions2014 } from "../data/dndConditions2014";
import { dndConditions2024 } from "../data/dndConditions2024";
import { validateCardDefinition } from "./cardPlatformValidation";
import { adaptDndCondition } from "./cardPlatformDndConditionAdapter";

describe("D&D condition Card Platform adapter", () => {
  it("adapts every condition with exact-edition identity and valid universal cards", () => {
    const fixtures = [
      { conditions: dndConditions2014, gameSystemId: "dnd-2014" as const },
      { conditions: dndConditions2024, gameSystemId: "dnd-2024" as const }
    ];

    for (const fixture of fixtures) {
      const cards = fixture.conditions.map(adaptDndCondition);
      expect(cards).toHaveLength(fixture.conditions.length);
      expect(new Set(cards.map((card) => card.id).size).toBeUndefined();
    }
  });

  it("preserves source, ordered effects, and shared print dimensions", () => {
    for (const condition of [...dndConditions2014, ...dndConditions2024]) {
      const card = adaptDndCondition(condition);
      expect(card.gameSystemId).toBe(
        condition.edition === "srd-5.1-2014" ? "dnd-2014" : "dnd-2024"
      );
      expect(card.family).toBe("condition");
      expect(card.source.title).toBe(condition.sourceReference);
      expect(card.source.url).toBe(condition.sourceUrl);
      expect(card.source.license).toBe("CC BY 4.0");
      expect(card.actions).toEqual([expect.objectContaining({
        kind: "procedure",
        steps: condition.effects
      })]);
      expect(card.print).toEqual({
        format: "standard-card",
        sizeId: "poker-2.5x3.5",
        faces: "front-back"
      });
      expect(validateCardDefinition(card)).toEqual([]);
    }
  });
});
