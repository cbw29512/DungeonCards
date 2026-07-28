import { describe, expect, it } from "vitest";
import {
  dndMagicItemBudgetForLevel,
  isDndCharacterVaultReady,
  validateDndOptimizedBuild
} from "../utils/dndCharacterVaultValidation";
import {
  dndVaultWizardProfiles,
  getDndVaultWizardProfile
} from "./dndVaultWizardProfiles";
import { getDndVaultReadyBuild } from "./dndVaultReadyBuilds";

describe("Wizard Evocation Character Vault profiles", () => {
  it("publishes every Wizard level in both editions", () => {
    expect(dndVaultWizardProfiles).toHaveLength(40);
    expect(new Set(dndVaultWizardProfiles.map((profile) => profile.id)).size).toBe(40);
    expect(new Set(dndVaultWizardProfiles.map((profile) => profile.buildSlotId)).size).toBe(40);
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      expect(dndVaultWizardProfiles
        .filter((profile) => profile.ruleset === ruleset)
        .map((profile) => profile.level)
      ).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    }
  });

  it("passes the complete Vault Ready release gate", () => {
    const failures = dndVaultWizardProfiles
      .map((profile) => ({ profile, issues: validateDndOptimizedBuild(profile) }))
      .filter(({ issues }) => issues.length > 0)
      .map(({ profile, issues }) => ({ id: profile.id, issues }));
    expect(failures).toEqual([]);
    expect(dndVaultWizardProfiles.every(isDndCharacterVaultReady)).toBe(true);
  });

  it("matches every level's magic-item budget and attunement ceiling", () => {
    for (const profile of dndVaultWizardProfiles) {
      const expected = dndMagicItemBudgetForLevel(profile.level);
      const actual = Object.fromEntries(Object.keys(expected).map((rarity) => [
        rarity,
        profile.magicItems.filter((item) => item.rarity === rarity).length
      ]));
      expect(actual).toEqual(expected);
      expect(profile.magicItems.filter((item) => item.attunedByDefault).length).toBeLessThanOrEqual(3);
    }
  });

  it("keeps edition-specific Evocation unlock levels and features", () => {
    const wizard2014Level2 = getDndVaultWizardProfile("srd-5.1-2014", 2)!;
    expect(wizard2014Level2.character.subclassId).toBe("school-evocation");
    expect(wizard2014Level2.character.subclassFeatures.join(" ")).toContain("Sculpt Spells");
    expect(getDndVaultWizardProfile("srd-5.2.1-2024", 2)?.character.subclassFeatures).toEqual([]);
    expect(getDndVaultWizardProfile("srd-5.2.1-2024", 3)?.character.subclassFeatures.join(" ")).toContain("Potent Cantrip");
    expect(getDndVaultWizardProfile("srd-5.2.1-2024", 6)?.character.subclassFeatures.join(" ")).toContain("Sculpt Spells");
  });

  it("uses complete prepared-spell and spellbook progression", () => {
    const wizard2014Level1 = getDndVaultWizardProfile("srd-5.1-2014", 1)!;
    const wizard2014Level20 = getDndVaultWizardProfile("srd-5.1-2014", 20)!;
    const wizard2024Level1 = getDndVaultWizardProfile("srd-5.2.1-2024", 1)!;
    const wizard2024Level20 = getDndVaultWizardProfile("srd-5.2.1-2024", 20)!;
    expect(wizard2014Level1.character.spellcasting.kind).toBe("prepared");
    expect(wizard2014Level1.character.spellcasting.kind === "prepared" && wizard2014Level1.character.spellcasting.spells).toHaveLength(4);
    expect(wizard2014Level20.character.spellcasting.kind === "prepared" && wizard2014Level20.character.spellcasting.spells).toHaveLength(25);
    expect(wizard2024Level1.character.spellcasting.kind === "prepared" && wizard2024Level1.character.spellcasting.spells.filter((name) => !name.includes("Magic Initiate"))).toHaveLength(4);
    expect(wizard2024Level20.character.spellcasting.kind === "prepared" && wizard2024Level20.character.spellcasting.spells.filter((name) => !name.includes("Magic Initiate"))).toHaveLength(25);
    expect(wizard2014Level20.character.spellcasting.kind === "prepared" && wizard2014Level20.character.spellcasting.notes).toContain("44 leveled spells");
    expect(wizard2024Level20.character.spellcasting.kind === "prepared" && wizard2024Level20.character.spellcasting.notes).toContain("44 leveled spells");
  });

  it("uses legal advancement and optimized final scores", () => {
    const wizard2014 = getDndVaultWizardProfile("srd-5.1-2014", 20)!;
    expect(wizard2014.advancementChoices.every((entry) => entry.kind === "ability-score")).toBe(true);
    expect(wizard2014.character.abilityScores).toMatchObject({ dex: 18, con: 16, int: 20, wis: 14 });
    expect(wizard2014.character.maximumHitPoints).toBe(142);

    const wizard2024 = getDndVaultWizardProfile("srd-5.2.1-2024", 20)!;
    expect(wizard2024.advancementChoices.map((entry) => entry.name)).toEqual(expect.arrayContaining([
      "Magic Initiate (Wizard)",
      "Skilled",
      "Boon of Spell Recall"
    ]));
    expect(wizard2024.character.abilityScores).toMatchObject({ dex: 16, con: 18, int: 20, wis: 13 });
    expect(wizard2024.character.maximumHitPoints).toBe(162);
    expect(wizard2024.character.resources.map((resource) => resource.name)).toEqual(expect.arrayContaining([
      "Spell Mastery — Magic Missile",
      "Signature Spell — Fireball"
    ]));
  });

  it("registers every Wizard slot through the central lookup", () => {
    for (const profile of dndVaultWizardProfiles) {
      expect(getDndVaultReadyBuild(profile.ruleset, profile.classId, profile.subclassId, profile.level)).toBe(profile);
    }
  });
});
