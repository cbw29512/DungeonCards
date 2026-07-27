import { describe, expect, it } from "vitest";
import {
  dndMagicItemBudgetForLevel,
  isDndCharacterVaultReady,
  validateDndOptimizedBuild
} from "../utils/dndCharacterVaultValidation";
import { dndSpellAttackBonus, dndSpellSaveDc } from "../utils/dndCharacterRecord";
import { getDndClericPregenRecord } from "./dndClericPregens";
import {
  dndVaultClericProfiles,
  getDndVaultClericProfile
} from "./dndVaultClericProfiles";
import { getDndVaultReadyBuild } from "./dndVaultReadyBuilds";

describe("Life Cleric Character Vault profiles", () => {
  it("publishes one optimized profile for every Cleric level in both editions", () => {
    expect(dndVaultClericProfiles).toHaveLength(40);
    expect(new Set(dndVaultClericProfiles.map((profile) => profile.id)).size).toBe(40);
    expect(new Set(dndVaultClericProfiles.map((profile) => profile.buildSlotId)).size).toBe(40);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      expect(dndVaultClericProfiles
        .filter((profile) => profile.ruleset === ruleset)
        .map((profile) => profile.level)
      ).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    }
  });

  it("requires every Cleric profile and embedded character to pass Vault Ready", () => {
    const failures = dndVaultClericProfiles
      .map((profile) => ({ profile, issues: validateDndOptimizedBuild(profile) }))
      .filter(({ issues }) => issues.length > 0)
      .map(({ profile, issues }) => ({ id: profile.id, issues }));
    expect(failures).toEqual([]);
    expect(dndVaultClericProfiles.every(isDndCharacterVaultReady)).toBe(true);
  });

  it("matches every level's exact item budget and attunement plan", () => {
    for (const profile of dndVaultClericProfiles) {
      const expected = dndMagicItemBudgetForLevel(profile.level);
      const actual = Object.fromEntries(Object.keys(expected).map((rarity) => [
        rarity,
        profile.magicItems.filter((item) => item.rarity === rarity).length
      ]));
      expect(actual).toEqual(expected);
      expect(profile.magicItems.filter((item) => item.attunedByDefault)).toHaveLength(
        profile.level >= 17 ? 3 : profile.level >= 11 ? 2 : profile.level >= 5 ? 1 : 0
      );
    }
  });

  it("optimizes the 2014 Life Cleric around Wisdom 20 and Constitution 20", () => {
    const cleric2014 = getDndVaultClericProfile("srd-5.1-2014", 20)!;
    expect(cleric2014.advancementChoices.every((choice) => choice.kind === "ability-score")).toBe(true);
    expect(cleric2014.character.abilityScores).toMatchObject({ wis: 20, con: 20 });
    expect(cleric2014.character.maximumHitPoints).toBe(223);
    expect(cleric2014.optimizationNotes.join(" ")).toContain("public 2014 feat set");
  });

  it("builds the 2024 Life Cleric around concentration and Constitution saves", () => {
    const cleric2024 = getDndVaultClericProfile("srd-5.2.1-2024", 20)!;
    expect(cleric2024.advancementChoices.map((choice) => choice.name)).toEqual(expect.arrayContaining([
      "Magic Initiate (Cleric)",
      "War Caster",
      "Wisdom +2",
      "Resilient (Constitution)",
      "Constitution +2",
      "Boon of Fate"
    ]));
    expect(cleric2024.character.abilityScores).toMatchObject({ wis: 20, con: 18 });
    expect(cleric2024.character.maximumHitPoints).toBe(203);
    expect(cleric2024.character.savingThrowProficiencies).toEqual(["wis", "cha", "con"]);
    expect(cleric2024.character.resources.find((resource) => resource.id === "boon-fate")).toMatchObject({ maximum: 1, refresh: "short-rest" });
    expect(dndSpellAttackBonus(cleric2024.character.abilityScores.wis, 20)).toBe(11);
    expect(dndSpellSaveDc(cleric2024.character.abilityScores.wis, 20)).toBe(19);
  });

  it("preserves the audited prepared spell and slot packages", () => {
    for (const profile of dndVaultClericProfiles) {
      const base = getDndClericPregenRecord(profile.ruleset, profile.level)!;
      expect(profile.character.spellcasting).toEqual(base.spellcasting);
    }
  });

  it("adds spell recovery at tier two and healing plus spell defense at higher tiers", () => {
    expect(getDndVaultClericProfile("srd-5.2.1-2024", 10)?.magicItems.map((item) => item.name)).toEqual([
      "Potion of Healing",
      "Pearl of Power"
    ]);
    expect(getDndVaultClericProfile("srd-5.2.1-2024", 11)?.magicItems.map((item) => item.name)).toEqual(expect.arrayContaining([
      "Staff of Healing",
      "Sentinel Shield"
    ]));
    const level17 = getDndVaultClericProfile("srd-5.2.1-2024", 17)!;
    expect(level17.magicItems.map((item) => item.name)).toEqual(expect.arrayContaining([
      "Necklace of Prayer Beads",
      "Spellguard Shield"
    ]));
    expect(level17.magicItems.find((item) => item.name === "Staff of Healing")?.maximumCharges).toBe(10);
    expect(level17.magicItems.find((item) => item.name === "Necklace of Prayer Beads")?.maximumCharges).toBe(4);
  });

  it("registers every Cleric slot through the central live lookup", () => {
    for (const profile of dndVaultClericProfiles) {
      expect(getDndVaultReadyBuild(profile.ruleset, profile.classId, profile.subclassId, profile.level)).toBe(profile);
    }
  });
});
