import { describe, expect, it } from "vitest";
import { generateDndCharacterCardBundle } from "../utils/dndCharacterCardGeneration";
import {
  dndMagicItemBudgetForLevel,
  isDndCharacterVaultReady,
  validateDndOptimizedBuild
} from "../utils/dndCharacterVaultValidation";
import { getDndVaultReadyBuild } from "./dndVaultReadyBuilds";
import {
  dndVaultBardProfiles,
  getDndVaultBardProfile
} from "./dndVaultBardProfiles";

describe("Bard College of Lore Character Vault profiles", () => {
  it("publishes every Bard level in both editions", () => {
    expect(dndVaultBardProfiles).toHaveLength(40);
    expect(new Set(dndVaultBardProfiles.map((profile) => profile.id)).size).toBe(40);
    expect(new Set(dndVaultBardProfiles.map((profile) => profile.buildSlotId)).size).toBe(40);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      expect(dndVaultBardProfiles
        .filter((profile) => profile.ruleset === ruleset)
        .map((profile) => profile.level)
      ).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    }
  });

  it("passes the complete Vault Ready release gate", () => {
    const failures = dndVaultBardProfiles
      .map((profile) => ({ profile, issues: validateDndOptimizedBuild(profile) }))
      .filter(({ issues }) => issues.length > 0)
      .map(({ profile, issues }) => ({ id: profile.id, issues }));
    expect(failures).toEqual([]);
    expect(dndVaultBardProfiles.every(isDndCharacterVaultReady)).toBe(true);
  });

  it("matches every level's magic-item budget and attunement ceiling", () => {
    for (const profile of dndVaultBardProfiles) {
      const expected = dndMagicItemBudgetForLevel(profile.level);
      const actual = Object.fromEntries(Object.keys(expected).map((rarity) => [
        rarity,
        profile.magicItems.filter((item) => item.rarity === rarity).length
      ]));
      expect(actual).toEqual(expected);
      expect(profile.magicItems.filter((item) => item.attunedByDefault).length).toBeLessThanOrEqual(3);
    }
  });

  it("preserves 2014 spells-known accounting and Lore's extra discoveries", () => {
    const level1 = getDndVaultBardProfile("srd-5.1-2014", 1)!;
    const level6 = getDndVaultBardProfile("srd-5.1-2014", 6)!;
    const level20 = getDndVaultBardProfile("srd-5.1-2014", 20)!;
    expect(level1.character.spellcasting.kind).toBe("known");
    expect(level1.character.spellcasting.kind === "known" && level1.character.spellcasting.spells).toHaveLength(4);
    expect(level6.character.spellcasting.kind === "known" && level6.character.spellcasting.spells).toHaveLength(11);
    expect(level20.character.spellcasting.kind === "known" && level20.character.spellcasting.spells).toHaveLength(24);
    expect(level6.character.spellcasting.kind === "known" && level6.character.spellcasting.spells).toEqual(expect.arrayContaining(["Counterspell", "Fireball"]));
    expect(level20.character.spellcasting.kind === "known" && level20.character.spellcasting.spells).toEqual(expect.arrayContaining(["Wish", "Mass Heal"]));
  });

  it("preserves 2024 prepared counts and always-prepared sources", () => {
    const level1 = getDndVaultBardProfile("srd-5.2.1-2024", 1)!;
    const level6 = getDndVaultBardProfile("srd-5.2.1-2024", 6)!;
    const level20 = getDndVaultBardProfile("srd-5.2.1-2024", 20)!;
    expect(level1.character.spellcasting.kind).toBe("prepared");
    expect(level1.character.spellcasting.kind === "prepared" && level1.character.spellcasting.spells).toHaveLength(5);
    expect(level6.character.spellcasting.kind === "prepared" && level6.character.spellcasting.spells).toHaveLength(13);
    expect(level20.character.spellcasting.kind === "prepared" && level20.character.spellcasting.spells).toHaveLength(27);
    expect(level1.character.spellcasting.kind === "prepared" && level1.character.spellcasting.spells).toContain("Bless");
    expect(level6.character.spellcasting.kind === "prepared" && level6.character.spellcasting.spells).toEqual(expect.arrayContaining(["Counterspell", "Fireball"]));
    expect(level20.character.spellcasting.kind === "prepared" && level20.character.spellcasting.spells).toEqual(expect.arrayContaining(["Power Word Heal", "Power Word Kill", "Wish"]));
  });

  it("links every selected level-20 spell to the exact-edition SRD catalog", () => {
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      const profile = getDndVaultBardProfile(ruleset, 20)!;
      const spells = generateDndCharacterCardBundle(profile).definitions.filter((card) => card.family === "spell");
      expect(spells.length).toBeGreaterThan(20);
      expect(spells.every((card) => (
        card.source.kind === "srd"
        && card.source.edition === ruleset
        && typeof card.source.page === "number"
      ))).toBe(true);
    }
  });

  it("scales Inspiration, Expertise, and edition-specific capstones", () => {
    const bard2014 = getDndVaultBardProfile("srd-5.1-2014", 20)!;
    expect(bard2014.character.resources).toContainEqual(expect.objectContaining({ name: "Bardic Inspiration (d12)", maximum: 5, refresh: "short-rest" }));
    expect(bard2014.character.classFeatures.join(" ")).toContain("Superior Inspiration");
    expect(bard2014.character.subclassFeatures.join(" ")).toContain("Peerless Skill");

    const bard2024 = getDndVaultBardProfile("srd-5.2.1-2024", 20)!;
    expect(bard2024.character.resources).toContainEqual(expect.objectContaining({ name: "Bardic Inspiration (d12)", maximum: 5, refresh: "short-rest" }));
    expect(bard2024.character.resources).toContainEqual(expect.objectContaining({ id: "magic-initiate-bless", maximum: 1 }));
    expect(bard2024.character.classFeatures.join(" ")).toContain("Words of Creation");
    expect(bard2024.character.subclassFeatures.join(" ")).toContain("not expended if the roll still fails");
  });

  it("uses legal advancement and optimized final scores", () => {
    const bard2014 = getDndVaultBardProfile("srd-5.1-2014", 20)!;
    expect(bard2014.advancementChoices.every((entry) => entry.kind === "ability-score")).toBe(true);
    expect(bard2014.character.abilityScores).toMatchObject({ dex: 20, con: 16, cha: 20 });
    expect(bard2014.character.maximumHitPoints).toBe(163);

    const bard2024 = getDndVaultBardProfile("srd-5.2.1-2024", 20)!;
    expect(bard2024.advancementChoices.map((entry) => entry.name)).toEqual(expect.arrayContaining([
      "Magic Initiate (Cleric)", "Skilled", "Boon of Spell Recall"
    ]));
    expect(bard2024.character.abilityScores).toMatchObject({ dex: 16, con: 16, wis: 14, cha: 20 });
    expect(bard2024.character.maximumHitPoints).toBe(163);
  });

  it("registers every Bard slot through the central lookup", () => {
    for (const profile of dndVaultBardProfiles) {
      expect(getDndVaultReadyBuild(profile.ruleset, profile.classId, profile.subclassId, profile.level)).toBe(profile);
    }
  });
});
