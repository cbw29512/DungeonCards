import { describe, expect, it } from "vitest";
import {
  dndMagicItemBudgetForLevel,
  isDndCharacterVaultReady,
  validateDndOptimizedBuild
} from "../utils/dndCharacterVaultValidation";
import {
  dndVaultBarbarianProfiles,
  getDndVaultBarbarianProfile
} from "./dndVaultBarbarianProfiles";
import { getDndVaultReadyBuild } from "./dndVaultReadyBuilds";

describe("Barbarian Berserker Character Vault profiles", () => {
  it("publishes one optimized profile for every Barbarian level in both editions", () => {
    expect(dndVaultBarbarianProfiles).toHaveLength(40);
    expect(new Set(dndVaultBarbarianProfiles.map((profile) => profile.id)).size).toBe(40);
    expect(new Set(dndVaultBarbarianProfiles.map((profile) => profile.buildSlotId)).size).toBe(40);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      expect(dndVaultBarbarianProfiles
        .filter((profile) => profile.ruleset === ruleset)
        .map((profile) => profile.level)
      ).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    }
  });

  it("requires every Barbarian profile and embedded character to pass Vault Ready", () => {
    const failures = dndVaultBarbarianProfiles
      .map((profile) => ({ profile, issues: validateDndOptimizedBuild(profile) }))
      .filter(({ issues }) => issues.length > 0)
      .map(({ profile, issues }) => ({ id: profile.id, issues }));
    expect(failures).toEqual([]);
    expect(dndVaultBarbarianProfiles.every(isDndCharacterVaultReady)).toBe(true);
  });

  it("matches every level's exact item budget and three-attunement ceiling", () => {
    for (const profile of dndVaultBarbarianProfiles) {
      const expected = dndMagicItemBudgetForLevel(profile.level);
      const actual = Object.fromEntries(Object.keys(expected).map((rarity) => [
        rarity,
        profile.magicItems.filter((item) => item.rarity === rarity).length
      ]));
      expect(actual).toEqual(expected);
      expect(profile.magicItems.filter((item) => item.attunedByDefault)).toHaveLength(
        profile.level >= 17 ? 3 : profile.level >= 11 ? 2 : 0
      );
    }
  });

  it("keeps the 2014 build public-SRD and explains Frenzy Exhaustion", () => {
    const barbarian2014 = getDndVaultBarbarianProfile("srd-5.1-2014", 20)!;
    expect(barbarian2014.advancementChoices.every((choice) => choice.kind === "ability-score")).toBe(true);
    expect(barbarian2014.optimizationNotes.join(" ")).toContain("Grappler");
    expect(barbarian2014.tactics.join(" ")).toContain("post-Rage Exhaustion");
    expect(barbarian2014.tactics.join(" ")).not.toContain("Adrenaline Rush");
  });

  it("builds the 2024 Berserker around great-weapon offense and mental defense", () => {
    const barbarian2024 = getDndVaultBarbarianProfile("srd-5.2.1-2024", 20)!;
    expect(barbarian2024.advancementChoices.map((choice) => choice.name)).toEqual(expect.arrayContaining([
      "Savage Attacker",
      "Great Weapon Master",
      "Strength +2",
      "Constitution +2",
      "Resilient (Wisdom)",
      "Boon of Irresistible Offense"
    ]));
    expect(barbarian2024.character.abilityScores).toMatchObject({ str: 24, dex: 14, con: 21, wis: 13 });
    expect(barbarian2024.character.maximumHitPoints).toBe(245);
    expect(barbarian2024.character.armorClass).toBe(17);
    expect(barbarian2024.character.savingThrowProficiencies).toEqual(["str", "con", "wis"]);
    expect(barbarian2024.character.attacks.find((attack) => attack.id === "greataxe")?.damageFormula).toBe("1d12+7");
    expect(barbarian2024.character.attacks.find((attack) => attack.id === "greataxe-rage")?.damageFormula).toBe("1d12+11");
    expect(barbarian2024.character.attacks.find((attack) => attack.id === "greataxe")?.notes).toContain("Great Weapon Master");
  });

  it("adds unarmored defense and flight at tier three, then giant strength at tier four", () => {
    expect(getDndVaultBarbarianProfile("srd-5.2.1-2024", 10)?.magicItems.map((item) => item.name)).toEqual([
      "Potion of Healing",
      "Weapon, +1"
    ]);
    expect(getDndVaultBarbarianProfile("srd-5.2.1-2024", 11)?.magicItems.map((item) => item.name)).toEqual(expect.arrayContaining([
      "Winged Boots",
      "Bracers of Defense"
    ]));
    expect(getDndVaultBarbarianProfile("srd-5.2.1-2024", 17)?.magicItems.map((item) => item.name)).toContain("Belt of Fire Giant Strength");
  });

  it("registers every Barbarian slot through the central live lookup", () => {
    for (const profile of dndVaultBarbarianProfiles) {
      expect(getDndVaultReadyBuild(profile.ruleset, profile.classId, profile.subclassId, profile.level)).toBe(profile);
    }
  });
});
