import { describe, expect, it } from "vitest";
import {
  dndMagicItemBudgetForLevel,
  isDndCharacterVaultReady,
  validateDndOptimizedBuild
} from "../utils/dndCharacterVaultValidation";
import {
  dndVaultRogueProfiles,
  getDndVaultRogueProfile
} from "./dndVaultRogueProfiles";
import { getDndVaultReadyBuild } from "./dndVaultReadyBuilds";

describe("Rogue Thief Character Vault profiles", () => {
  it("publishes every Rogue level in both editions", () => {
    expect(dndVaultRogueProfiles).toHaveLength(40);
    expect(new Set(dndVaultRogueProfiles.map((profile) => profile.id)).size).toBe(40);
    expect(new Set(dndVaultRogueProfiles.map((profile) => profile.buildSlotId)).size).toBe(40);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      expect(dndVaultRogueProfiles
        .filter((profile) => profile.ruleset === ruleset)
        .map((profile) => profile.level)
      ).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    }
  });

  it("passes the complete Vault Ready release gate", () => {
    const failures = dndVaultRogueProfiles
      .map((profile) => ({ profile, issues: validateDndOptimizedBuild(profile) }))
      .filter(({ issues }) => issues.length > 0)
      .map(({ profile, issues }) => ({ id: profile.id, issues }));
    expect(failures).toEqual([]);
    expect(dndVaultRogueProfiles.every(isDndCharacterVaultReady)).toBe(true);
  });

  it("matches every level's magic-item budget and attunement ceiling", () => {
    for (const profile of dndVaultRogueProfiles) {
      const expected = dndMagicItemBudgetForLevel(profile.level);
      const actual = Object.fromEntries(Object.keys(expected).map((rarity) => [
        rarity,
        profile.magicItems.filter((item) => item.rarity === rarity).length
      ]));
      expect(actual).toEqual(expected);
      expect(profile.magicItems.filter((item) => item.attunedByDefault).length).toBeLessThanOrEqual(3);
    }
  });

  it("scales Sneak Attack and edition-specific Thief features", () => {
    expect(getDndVaultRogueProfile("srd-5.1-2014", 1)?.character.attacks[0].notes).toContain("1d6");
    expect(getDndVaultRogueProfile("srd-5.1-2014", 20)?.character.attacks[0].notes).toContain("10d6");
    expect(getDndVaultRogueProfile("srd-5.1-2014", 17)?.character.subclassFeatures.join(" ")).toContain("Thief's Reflexes");
    expect(getDndVaultRogueProfile("srd-5.2.1-2024", 9)?.character.subclassFeatures.join(" ")).toContain("Stealth Attack");
    expect(getDndVaultRogueProfile("srd-5.2.1-2024", 13)?.character.subclassFeatures.join(" ")).toContain("four attunement slots");
  });

  it("uses legal advancement and optimized final scores", () => {
    const rogue2014 = getDndVaultRogueProfile("srd-5.1-2014", 20)!;
    expect(rogue2014.advancementChoices.every((entry) => entry.kind === "ability-score")).toBe(true);
    expect(rogue2014.character.abilityScores).toMatchObject({ dex: 20, con: 18, wis: 16, cha: 16 });
    expect(rogue2014.character.maximumHitPoints).toBe(183);

    const rogue2024 = getDndVaultRogueProfile("srd-5.2.1-2024", 20)!;
    expect(rogue2024.advancementChoices.map((entry) => entry.name)).toEqual(expect.arrayContaining([
      "Alert",
      "Skilled",
      "Boon of the Night Spirit"
    ]));
    expect(rogue2024.character.abilityScores).toMatchObject({ dex: 20, con: 18, int: 16, wis: 14 });
    expect(rogue2024.character.savingThrowProficiencies).toEqual(["dex", "int", "wis", "cha"]);
    expect(rogue2024.character.classFeatures).toContain("Cunning Strike save DC: 19");
  });

  it("registers every Rogue slot through the central lookup", () => {
    for (const profile of dndVaultRogueProfiles) {
      expect(getDndVaultReadyBuild(profile.ruleset, profile.classId, profile.subclassId, profile.level)).toBe(profile);
    }
  });
});
