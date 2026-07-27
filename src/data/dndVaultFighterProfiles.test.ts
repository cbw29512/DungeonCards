import { describe, expect, it } from "vitest";
import {
  dndMagicItemBudgetForLevel,
  isDndCharacterVaultReady,
  validateDndOptimizedBuild
} from "../utils/dndCharacterVaultValidation";
import {
  dndVaultFighterProfiles,
  getDndVaultFighterProfile
} from "./dndVaultFighterProfiles";
import {
  countDndVaultReadyBuilds,
  dndVaultReadyBuilds,
  getDndVaultReadyBuild
} from "./dndVaultReadyBuilds";

describe("Fighter Champion Character Vault profiles", () => {
  it("publishes one optimized profile for every Fighter level in both editions", () => {
    expect(dndVaultFighterProfiles).toHaveLength(40);
    expect(new Set(dndVaultFighterProfiles.map((profile) => profile.id)).size).toBe(40);
    expect(new Set(dndVaultFighterProfiles.map((profile) => profile.buildSlotId)).size).toBe(40);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      expect(dndVaultFighterProfiles
        .filter((profile) => profile.ruleset === ruleset)
        .map((profile) => profile.level)
      ).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    }
  });

  it("requires every Fighter profile and embedded character to pass Vault Ready", () => {
    const failures = dndVaultFighterProfiles
      .map((profile) => ({ profile, issues: validateDndOptimizedBuild(profile) }))
      .filter(({ issues }) => issues.length > 0)
      .map(({ profile, issues }) => ({ id: profile.id, issues }));
    expect(failures).toEqual([]);
    expect(dndVaultFighterProfiles.every(isDndCharacterVaultReady)).toBe(true);
  });

  it("matches every level's exact item budget and attunement ceiling", () => {
    for (const profile of dndVaultFighterProfiles) {
      const expected = dndMagicItemBudgetForLevel(profile.level);
      const actual = Object.fromEntries(Object.keys(expected).map((rarity) => [
        rarity,
        profile.magicItems.filter((item) => item.rarity === rarity).length
      ]));
      expect(actual).toEqual(expected);
      expect(profile.magicItems.filter((item) => item.attunedByDefault)).toHaveLength(
        profile.level >= 17 ? 3 : profile.level >= 11 ? 1 : 0
      );
    }
  });

  it("uses public 2014 ASIs instead of pretending paid feats are available", () => {
    const fighter2014 = getDndVaultFighterProfile("srd-5.1-2014", 20)!;
    expect(fighter2014.advancementChoices.every((choice) => choice.kind === "ability-score")).toBe(true);
    expect(fighter2014.optimizationNotes.join(" ")).toContain("Grappler");
  });

  it("builds the 2024 Champion around legal great-weapon feats", () => {
    const fighter2024 = getDndVaultFighterProfile("srd-5.2.1-2024", 20)!;
    expect(fighter2024.advancementChoices.map((choice) => choice.name)).toEqual(expect.arrayContaining([
      "Savage Attacker",
      "Skilled",
      "Great Weapon Master",
      "Heavy Armor Master",
      "Resilient (Wisdom)",
      "Speedy",
      "Boon of Combat Prowess"
    ]));
    expect(fighter2024.character.abilityScores).toMatchObject({ str: 20, dex: 14, con: 18, wis: 14 });
    expect(fighter2024.character.maximumHitPoints).toBe(200);
    expect(fighter2024.character.speedFeet).toBe(40);
    expect(fighter2024.character.savingThrowProficiencies).toContain("wis");
    expect(fighter2024.character.attacks.find((attack) => attack.id === "greatsword")?.notes).toContain("Great Weapon Master");
  });

  it("adds mobility and control only when the tier budget supports them", () => {
    expect(getDndVaultFighterProfile("srd-5.2.1-2024", 10)?.magicItems.map((item) => item.name)).toEqual([
      "Potion of Healing",
      "Weapon, +1"
    ]);
    expect(getDndVaultFighterProfile("srd-5.2.1-2024", 17)?.magicItems.map((item) => item.name)).toEqual(expect.arrayContaining([
      "Winged Boots",
      "Bead of Force",
      "Frost Brand"
    ]));
  });

  it("registers all Fighter profiles through the central live lookup", () => {
    expect(dndVaultReadyBuilds).toHaveLength(40);
    expect(countDndVaultReadyBuilds("srd-5.1-2014")).toBe(20);
    expect(countDndVaultReadyBuilds("srd-5.2.1-2024")).toBe(20);
    expect(getDndVaultReadyBuild("srd-5.2.1-2024", "fighter", "champion", 20)?.character.name).toBe("Rowan Ironmark");
  });
});
