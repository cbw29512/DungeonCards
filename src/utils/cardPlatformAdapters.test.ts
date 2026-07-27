import { describe, expect, it } from "vitest";
import type { DiceCard } from "../types/cards";
import type { RuleCard } from "../types/ruleCards";
import { adaptDiceCard } from "./cardPlatformDiceAdapter";
import { adaptRuleCard, gameSystemIdForRuleset } from "./cardPlatformRuleAdapter";
import { validateCardDefinition } from "./cardPlatformValidation";

const diceCard: DiceCard = {
  id: "longsword-damage",
  name: "Longsword Damage",
  category: "damage",
  formula: "1d8+3",
  description: "Roll one-handed longsword damage.",
  imageEmoji: "⚔️",
  isFavorite: false
};

const ruleCard: RuleCard = {
  id: "ability-check",
  name: "Ability Check",
  kind: "ability-check",
  imageEmoji: "🎲",
  variants: {
    "srd-5.1-2014": {
      ruleset: "srd-5.1-2014",
      source: "srd",
      sourceReference: "SRD 5.1 Ability Checks",
      summary: "Resolve an ability check using the 2014 rules.",
      detail: "Roll a d20, add the relevant modifier, and compare the total to the DC.",
      tags: ["ability-check", "d20"],
      modes: [{
        id: "check",
        label: "Ability Check",
        kind: "check",
        formula: "d20+0",
        allowsAdvantage: true,
        naturalRollRule: "none"
      }]
    },
    "srd-5.2.1-2024": {
      ruleset: "srd-5.2.1-2024",
      source: "srd",
      sourceReference: "SRD 5.2.1 D20 Tests",
      summary: "Resolve an ability check using the 2024 rules.",
      detail: "Roll a d20 and apply the current D20 Test procedure.",
      tags: ["ability-check", "d20-test"],
      modes: [{
        id: "check",
        label: "D20 Test",
        kind: "check",
        formula: "d20+0",
        allowsAdvantage: true,
        naturalRollRule: "none"
      }]
    }
  }
};

describe("Card Platform v2 compatibility adapters", () => {
  it("adapts a legacy DiceCard without losing formula or print size", () => {
    const adapted = adaptDiceCard(diceCard, {
      gameSystemId: "dnd-2014",
      source: {
        kind: "original",
        title: "DM Forge sample card",
        publicDistributionAllowed: true
      }
    });
    expect(adapted).toMatchObject({
      schemaVersion: 2,
      gameSystemId: "dnd-2014",
      family: "roll-action",
      print: { sizeId: "poker-2.5x3.5" }
    });
    expect(adapted.actions[0]).toMatchObject({ formula: "1d8+3", rollSystem: "dice-formula" });
    expect(validateCardDefinition(adapted)).toEqual([]);
  });

  it("maps each D&D ruleset to an exact game-system identity", () => {
    expect(gameSystemIdForRuleset("srd-5.1-2014")).toBe("dnd-2014");
    expect(gameSystemIdForRuleset("srd-5.2.1-2024")).toBe("dnd-2024");
    const legacy = adaptRuleCard(ruleCard, "srd-5.1-2014");
    const current = adaptRuleCard(ruleCard, "srd-5.2.1-2024");
    expect(legacy?.id).toBe("legacy-rule:dnd-2014:ability-check");
    expect(current?.id).toBe("legacy-rule:dnd-2024:ability-check");
    expect(legacy?.content.summary).toContain("2014");
    expect(current?.content.summary).toContain("2024");
    expect(validateCardDefinition(legacy as NonNullable<typeof legacy>)).toEqual([]);
    expect(validateCardDefinition(current as NonNullable<typeof current>)).toEqual([]);
  });

  it("returns no adapter output when the requested ruleset variant is absent", () => {
    const only2014: RuleCard = {
      ...ruleCard,
      variants: { "srd-5.1-2014": ruleCard.variants["srd-5.1-2014"] }
    };
    expect(adaptRuleCard(only2014, "srd-5.2.1-2024")).toBeNull();
  });
});
