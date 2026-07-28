import { describe, expect, it } from "vitest";
import {
  dndMagicItemBudgetForLevel,
  isDndCharacterVaultReady,
  validateDndOptimizedBuild
} from "../utils/dndCharacterVaultValidation";
import { devotionOathSpells } from "./dndPaladinPregenShared";
import { getDndVaultReadyBuild } from "./dndVaultReadyBuilds";
import {
  dndVaultPaladinProfiles,
  getDndVaultPaladinProfile
} from "./dndVaultPaladinProfiles";

describe("Paladin Oath of Devotion Character Vault profiles", () => {
  it("publishes every Paladin level in both editions", () => {
    expect(dndVaultPaladinProfiles).toHaveLength(40);
    expect(new Set(dndVaultPaladinProfiles.map((profile) => profile.id)).size).toBe(40);
    expect(new Set(dndVaultPaladinProfiles.map((profile) => profile.buildSlotId)).size).toBe(40);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      expect(dndVaultPaladinProfiles
        .filter((profile) => profile.ruleset === ruleset)
        .map((profile) => profile.level)
      ).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    }
  });

  it("passes the complete Vault Ready release gate", () => {
    const failures = dndVaultPaladinProfiles
      .map((profile) => ({ profile, issues: validateDndOptimizedBuild(profile) }))
      .filter(({ issues }) => issues.length > 0)
      .map(({ profile, issues }) => ({ id: profile.id, issues }));
    expect(failures).toEqual([]);
    expect(dndVaultPaladinProfiles.every(isDndCharacterVaultReady)).toBe(true);
  });

  it("matches every level's magic-item budget and attunement ceiling", () => {
    for (const profile of dndVaultPaladinProfiles) {
      const expected = dndMagicItemBudgetForLevel(profile.level);
      const actual = Object.fromEntries(Object.keys(expected).map((rarity) => [
        rarity,
        profile.magicItems.filter((item) => item.rarity === rarity).length
      ]));
      expect(actual).toEqual(expected);
      expect(profile.magicItems.filter((item) => item.attunedByDefault).length).toBeLessThanOrEqual(3);
    }
  });

  it("preserves exact-edition spellcasting and oath spells", () => {
    const paladin2014Level1 = getDndVaultPaladinProfile("srd-5.1-2014", 1)!;
    const paladin2014Level2 = getDndVaultPaladinProfile("srd-5.1-2014", 2)!;
    const paladin2024Level1 = getDndVaultPaladinProfile("srd-5.2.1-2024", 1)!;
    expect(paladin2014Level1.character.spellcasting.kind).toBe("none");
    expect(paladin2014Level2.character.spellcasting.kind === "prepared" && paladin2014Level2.character.spellcasting.slotsByLevel).toEqual({ 1: 2 });
    expect(paladin2024Level1.character.spellcasting.kind === "prepared" && paladin2024Level1.character.spellcasting.slotsByLevel).toEqual({ 1: 2 });
    expect(devotionOathSpells("srd-5.1-2014", 3)).toEqual(expect.arrayContaining(["Sanctuary"]));
    expect(devotionOathSpells("srd-5.2.1-2024", 3)).toEqual(expect.arrayContaining(["Shield of Faith"]));
    expect(devotionOathSpells("srd-5.2.1-2024", 3)).not.toContain("Sanctuary");
  });

  it("tracks Lay on Hands, Channel Divinity, smite, and steed resources", () => {
    const paladin2014 = getDndVaultPaladinProfile("srd-5.1-2014", 20)!;
    expect(paladin2014.character.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "lay-on-hands", maximum: 100 }),
      expect.objectContaining({ id: "divine-sense", maximum: 6 }),
      expect.objectContaining({ id: "channel-divinity", maximum: 1, refresh: "short-rest" }),
      expect.objectContaining({ id: "cleansing-touch", maximum: 5 })
    ]));

    const paladin2024 = getDndVaultPaladinProfile("srd-5.2.1-2024", 20)!;
    expect(paladin2024.character.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "lay-on-hands", maximum: 100 }),
      expect.objectContaining({ id: "channel-divinity", maximum: 3 }),
      expect.objectContaining({ id: "paladins-smite", maximum: 1 }),
      expect.objectContaining({ id: "faithful-steed", maximum: 1 }),
      expect.objectContaining({ id: "holy-nimbus", maximum: 1 })
    ]));
  });

  it("uses legal advancement, final scores, and radiant attack progression", () => {
    const paladin2014 = getDndVaultPaladinProfile("srd-5.1-2014", 20)!;
    expect(paladin2014.advancementChoices.every((entry) => entry.kind === "ability-score")).toBe(true);
    expect(paladin2014.character.abilityScores).toMatchObject({ str: 20, con: 16, cha: 20 });
    expect(paladin2014.character.maximumHitPoints).toBe(184);
    expect(paladin2014.character.attacks[0].notes).toContain("Improved Divine Smite adds 1d8 radiant");

    const paladin2024 = getDndVaultPaladinProfile("srd-5.2.1-2024", 20)!;
    expect(paladin2024.advancementChoices.map((entry) => entry.name)).toEqual(expect.arrayContaining([
      "Savage Attacker",
      "Skilled",
      "Boon of Truesight"
    ]));
    expect(paladin2024.character.abilityScores).toMatchObject({ str: 20, con: 15, cha: 20 });
    expect(paladin2024.character.maximumHitPoints).toBe(164);
    expect(paladin2024.character.senses).toContain("Truesight 60 ft.");
    expect(paladin2024.character.attacks[0].notes).toContain("Radiant Strikes adds 1d8 radiant");
  });

  it("registers every Paladin slot through the central lookup", () => {
    for (const profile of dndVaultPaladinProfiles) {
      expect(getDndVaultReadyBuild(profile.ruleset, profile.classId, profile.subclassId, profile.level)).toBe(profile);
    }
  });
});
