import { describe, expect, it } from "vitest";
import { generateDndCharacterCardBundle } from "../utils/dndCharacterCardGeneration";
import {
  dndMagicItemBudgetForLevel,
  isDndCharacterVaultReady,
  validateDndOptimizedBuild
} from "../utils/dndCharacterVaultValidation";
import { getDndVaultReadyBuild } from "./dndVaultReadyBuilds";
import {
  dndVaultRangerProfiles,
  getDndVaultRangerProfile
} from "./dndVaultRangerProfiles";

describe("Ranger Hunter Character Vault profiles", () => {
  it("publishes every Ranger level in both editions", () => {
    expect(dndVaultRangerProfiles).toHaveLength(40);
    expect(new Set(dndVaultRangerProfiles.map((profile) => profile.id)).size).toBe(40);
    expect(new Set(dndVaultRangerProfiles.map((profile) => profile.buildSlotId)).size).toBe(40);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      expect(dndVaultRangerProfiles
        .filter((profile) => profile.ruleset === ruleset)
        .map((profile) => profile.level)
      ).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    }
  });

  it("passes the complete Vault Ready release gate", () => {
    const failures = dndVaultRangerProfiles
      .map((profile) => ({ profile, issues: validateDndOptimizedBuild(profile) }))
      .filter(({ issues }) => issues.length > 0)
      .map(({ profile, issues }) => ({ id: profile.id, issues }));
    expect(failures).toEqual([]);
    expect(dndVaultRangerProfiles.every(isDndCharacterVaultReady)).toBe(true);
  });

  it("matches every level's magic-item budget and attunement ceiling", () => {
    for (const profile of dndVaultRangerProfiles) {
      const expected = dndMagicItemBudgetForLevel(profile.level);
      const actual = Object.fromEntries(Object.keys(expected).map((rarity) => [
        rarity,
        profile.magicItems.filter((item) => item.rarity === rarity).length
      ]));
      expect(actual).toEqual(expected);
      expect(profile.magicItems.filter((item) => item.attunedByDefault).length).toBeLessThanOrEqual(3);
    }
  });

  it("preserves the edition split in Ranger spellcasting", () => {
    const ranger2014Level1 = getDndVaultRangerProfile("srd-5.1-2014", 1)!;
    const ranger2014Level2 = getDndVaultRangerProfile("srd-5.1-2014", 2)!;
    const ranger2014Level20 = getDndVaultRangerProfile("srd-5.1-2014", 20)!;
    const ranger2024Level1 = getDndVaultRangerProfile("srd-5.2.1-2024", 1)!;
    const ranger2024Level20 = getDndVaultRangerProfile("srd-5.2.1-2024", 20)!;
    expect(ranger2014Level1.character.spellcasting.kind).toBe("none");
    expect(ranger2014Level2.character.spellcasting.kind).toBe("known");
    expect(ranger2014Level2.character.spellcasting.kind === "known" && ranger2014Level2.character.spellcasting.spells).toEqual(["Hunter's Mark", "Cure Wounds"]);
    expect(ranger2014Level20.character.spellcasting.kind === "known" && ranger2014Level20.character.spellcasting.spells).toHaveLength(11);
    expect(ranger2024Level1.character.spellcasting.kind).toBe("prepared");
    expect(ranger2024Level1.character.spellcasting.kind === "prepared" && ranger2024Level1.character.spellcasting.spells).toHaveLength(3);
    expect(ranger2024Level20.character.spellcasting.kind === "prepared" && ranger2024Level20.character.spellcasting.spells).toHaveLength(16);
    expect(ranger2024Level1.character.spellcasting.kind === "prepared" && ranger2024Level1.character.spellcasting.spells).toContain("Hunter's Mark");
  });

  it("links every selected level-20 spell to the exact-edition SRD catalog", () => {
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      const profile = getDndVaultRangerProfile(ruleset, 20)!;
      const spells = generateDndCharacterCardBundle(profile).definitions.filter((card) => card.family === "spell");
      expect(spells.length).toBeGreaterThan(10);
      const unresolved = spells
        .filter((card) => !(
          card.source.kind === "srd"
          && card.source.edition === ruleset
          && typeof card.source.page === "number"
        ))
        .map((card) => card.content.title);
      expect(unresolved).toEqual([]);
    }
  });

  it("tracks exact Hunter choices and 2024 Favored Enemy resources", () => {
    const ranger2014 = getDndVaultRangerProfile("srd-5.1-2014", 20)!;
    expect(ranger2014.character.subclassFeatures.join(" ")).toEqual(expect.stringContaining("Colossus Slayer"));
    expect(ranger2014.character.subclassFeatures.join(" ")).toEqual(expect.stringContaining("Multiattack Defense"));
    expect(ranger2014.character.subclassFeatures.join(" ")).toEqual(expect.stringContaining("Volley"));
    expect(ranger2014.character.subclassFeatures.join(" ")).toEqual(expect.stringContaining("Evasion"));

    const ranger2024 = getDndVaultRangerProfile("srd-5.2.1-2024", 20)!;
    expect(ranger2024.character.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "favored-enemy-hunters-mark", maximum: 6 }),
      expect.objectContaining({ id: "tireless", maximum: 5 }),
      expect.objectContaining({ id: "natures-veil", maximum: 5 })
    ]));
    expect(ranger2024.character.subclassFeatures.join(" ")).toContain("Hunter's Lore");
    expect(ranger2024.character.subclassFeatures.join(" ")).toContain("Resistance");
    expect(ranger2024.character.attacks[0].notes).toContain("Hunter's Mark adds 1d10");
  });

  it("uses legal advancement and optimized final scores", () => {
    const ranger2014 = getDndVaultRangerProfile("srd-5.1-2014", 20)!;
    expect(ranger2014.advancementChoices.every((entry) => entry.kind === "ability-score")).toBe(true);
    expect(ranger2014.character.abilityScores).toMatchObject({ dex: 20, con: 17, wis: 20 });
    expect(ranger2014.character.maximumHitPoints).toBe(184);

    const ranger2024 = getDndVaultRangerProfile("srd-5.2.1-2024", 20)!;
    expect(ranger2024.advancementChoices.map((entry) => entry.name)).toEqual(expect.arrayContaining([
      "Savage Attacker", "Skilled", "Boon of Dimensional Travel"
    ]));
    expect(ranger2024.character.abilityScores).toMatchObject({ dex: 20, con: 14, wis: 20 });
    expect(ranger2024.character.maximumHitPoints).toBe(164);
    expect(ranger2024.character.senses).toContain("Blindsight 30 ft.");
  });

  it("registers every Ranger slot through the central lookup", () => {
    for (const profile of dndVaultRangerProfiles) {
      expect(getDndVaultReadyBuild(profile.ruleset, profile.classId, profile.subclassId, profile.level)).toBe(profile);
    }
  });
});
