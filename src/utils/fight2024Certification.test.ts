import { describe, expect, it } from "vitest";
import { dndPregenClassDefinitions } from "../data/dndPregenCatalog";
import {
  FIGHT_2024_EXPECTED_CLASS_COUNT,
  FIGHT_2024_EXPECTED_HERO_COUNT,
  FIGHT_2024_EXPECTED_MONSTER_COUNT,
  FIGHT_2024_RULESET,
  assertFight2024CertificationComplete,
  buildFight2024CertificationReport,
  extractFight2024NamedMechanics,
  type Fight2024CertificationReport
} from "./fight2024Certification";

describe("5.5e Fight Cards certification", () => {
  it("locks the public SRD roster to twelve classes, one subclass each, and levels 1-20", () => {
    const definitions = dndPregenClassDefinitions.filter((definition) => definition.ruleset === FIGHT_2024_RULESET);
    expect(definitions).toHaveLength(FIGHT_2024_EXPECTED_CLASS_COUNT);
    expect(new Set(definitions.map((definition) => definition.classId)).size).toBe(FIGHT_2024_EXPECTED_CLASS_COUNT);
    expect(new Set(definitions.map((definition) => `${definition.classId}:${definition.subclassId}`)).size).toBe(FIGHT_2024_EXPECTED_CLASS_COUNT);
    expect(FIGHT_2024_EXPECTED_HERO_COUNT).toBe(240);
  });

  it("requires the complete SRD 5.2.1 monster source roster rather than a filtered executable subset", () => {
    const report = buildFight2024CertificationReport();
    expect(report.ruleset).toBe(FIGHT_2024_RULESET);
    expect(report.monsterTarget).toBe(FIGHT_2024_EXPECTED_MONSTER_COUNT);
    expect(report.monsterSourceCount).toBe(FIGHT_2024_EXPECTED_MONSTER_COUNT);
    expect(report.heroTarget).toBe(FIGHT_2024_EXPECTED_HERO_COUNT);
    expect(report.heroBuildCount).toBeLessThanOrEqual(report.heroTarget);
    expect(report.heroExecutableCount).toBeLessThanOrEqual(report.heroBuildCount);
    expect(report.monsterFullyModeledCount).toBeLessThanOrEqual(report.monsterExecutableCount);
    expect(report.monsterExecutableCount).toBeLessThanOrEqual(report.monsterSourceCount);
  });

  it("splits named SRD mechanics without discarding recharge labels", () => {
    expect(extractFight2024NamedMechanics([
      "Multiattack. The dragon makes three attacks.",
      "Fire Breath (Recharge 5–6). The dragon exhales fire in a 30-foot cone."
    ].join("\n")).map((entry) => entry.name)).toEqual([
      "Multiattack",
      "Fire Breath (Recharge 5–6)"
    ]);
  });

  it("only passes the release assertion when every target is certified", () => {
    const incomplete: Fight2024CertificationReport = {
      ruleset: FIGHT_2024_RULESET,
      heroTarget: FIGHT_2024_EXPECTED_HERO_COUNT,
      heroBuildCount: FIGHT_2024_EXPECTED_HERO_COUNT,
      heroExecutableCount: FIGHT_2024_EXPECTED_HERO_COUNT - 1,
      heroIssues: [],
      monsterTarget: FIGHT_2024_EXPECTED_MONSTER_COUNT,
      monsterSourceCount: FIGHT_2024_EXPECTED_MONSTER_COUNT,
      monsterExecutableCount: FIGHT_2024_EXPECTED_MONSTER_COUNT,
      monsterFullyModeledCount: FIGHT_2024_EXPECTED_MONSTER_COUNT,
      monsterIssues: [],
      complete: false
    };
    expect(() => assertFight2024CertificationComplete(incomplete)).toThrow(/incomplete/i);
  });
});
