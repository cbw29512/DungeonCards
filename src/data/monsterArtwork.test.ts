import { describe, expect, it } from "vitest";
import { getMonsterArtwork, monsterArtwork } from "./monsterArtwork";

const allowedLicenses = new Set([
  "public-domain",
  "cc0-1.0",
  "cc-by-4.0",
  "cc-by-sa-4.0",
  "gpl-2.0-or-later",
  "direct-permission",
  "original"
]);

describe("licensed monster artwork manifest", () => {
  it("requires complete licensing and attribution metadata", () => {
    monsterArtwork.forEach((artwork) => {
      expect(allowedLicenses.has(artwork.licenseId)).toBe(true);
      expect(artwork.creator.trim()).not.toBe("");
      expect(artwork.attribution.trim()).not.toBe("");
      expect(artwork.modifications.trim()).not.toBe("");
      expect(artwork.imageUrl).toMatch(/^https:\/\//);
      expect(artwork.sourcePageUrl).toMatch(/^https:\/\//);
      expect(artwork.licenseUrl).toMatch(/^https:\/\//);
      expect(artwork.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("does not accept official Wizards or D&D Beyond artwork hosts", () => {
    monsterArtwork.forEach((artwork) => {
      expect(artwork.imageUrl).not.toMatch(/(?:wizards\.com|dndbeyond\.com)/i);
      expect(artwork.sourcePageUrl).not.toMatch(/(?:wizards\.com|dndbeyond\.com)/i);
    });
  });

  it("uses unique artwork IDs and monster-ruleset assignments", () => {
    const ids = monsterArtwork.map((artwork) => artwork.id);
    expect(new Set(ids).size).toBe(ids.length);

    const assignments = monsterArtwork.flatMap((artwork) =>
      artwork.rulesets.map((ruleset) => `${ruleset}:${artwork.monsterName.toLowerCase()}`)
    );
    expect(new Set(assignments).size).toBe(assignments.length);
  });

  it("resolves the first verified Goblin Dragon and Lich artwork records", () => {
    expect(getMonsterArtwork("srd-5.1-2014", "Goblin")?.licenseId).toBe("public-domain");
    expect(getMonsterArtwork("srd-5.1-2014", "Adult Black Dragon")?.licenseId).toBe("public-domain");
    expect(getMonsterArtwork("srd-5.1-2014", "Lich")?.licenseId).toBe("gpl-2.0-or-later");
    expect(getMonsterArtwork("srd-5.1-2014", "Aboleth")).toBeUndefined();
  });
});
