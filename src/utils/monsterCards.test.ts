import { describe, expect, it } from "vitest";
import { monsterCatalog, monsterHomebrewExample } from "../data/monsterCatalog";
import {
  abilityModifier,
  estimateMonsterLayout,
  getMonsterCompletenessWarnings,
  getMonsterPrintLayout,
  monsterRulesetLabel
} from "./monsterCards";

describe("monster cards", () => {
  it("calculates ability modifiers correctly", () => {
    expect(abilityModifier(8)).toBe("-1");
    expect(abilityModifier(10)).toBe("+0");
    expect(abilityModifier(23)).toBe("+6");
  });

  it("keeps catalog IDs unique and combat data complete", () => {
    const ids = monsterCatalog.map((monster) => monster.id);
    expect(new Set(ids).size).toBe(ids.length);

    monsterCatalog.forEach((monster) => {
      expect(monster.name).not.toBe("");
      expect(monster.ac).not.toBe("");
      expect(monster.hp).not.toBe("");
      expect(monster.speed).not.toBe("");
      expect(monster.actions.length).toBeGreaterThan(0);
      expect(monster.source).toContain("Monster Card Forge");
      expect(getMonsterCompletenessWarnings(monster)).toEqual([]);
    });
  });

  it("reports missing fields required by the Monster Library", () => {
    const incomplete = {
      ...monsterHomebrewExample,
      name: "",
      speed: "",
      actions: [{ name: "" }]
    };

    expect(getMonsterCompletenessWarnings(incomplete)).toEqual([
      "Add a monster name.",
      "Add movement speed.",
      "Add at least one named action."
    ]);
  });

  it("preserves explicit ruleset labels", () => {
    expect(monsterCatalog.every((monster) => monster.ruleset === "srd-5.1-2014")).toBe(true);
    expect(monsterRulesetLabel(monsterCatalog[0])).toBe("2014 SRD");
    expect(monsterRulesetLabel(monsterHomebrewExample)).toBe("Homebrew");
  });

  it("uses standard cards for simple monsters and folios for bosses", () => {
    const goblin = monsterCatalog.find((monster) => monster.id === "goblin-2014")!;
    const dragon = monsterCatalog.find((monster) => monster.id === "adult-black-dragon-2014")!;
    const lich = monsterCatalog.find((monster) => monster.id === "lich-2014")!;

    expect(estimateMonsterLayout(goblin)).toBe("standard");
    expect(estimateMonsterLayout(dragon)).toBe("accordion");
    expect(estimateMonsterLayout(lich)).toBe("accordion");
    expect(getMonsterPrintLayout(goblin)).toBe("card");
    expect(getMonsterPrintLayout(dragon)).toBe("folio");
    expect(getMonsterPrintLayout(lich)).toBe("folio");
  });
});
