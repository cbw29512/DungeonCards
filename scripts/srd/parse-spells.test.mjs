import { describe, expect, it } from "vitest";
import { parseSpells } from "./parse-spells.mjs";

const modernSource = {
  edition: "srd-5.2.1-2024",
  version: "5.2.1",
  spellPages: [107, 176]
};

const legacySource = {
  edition: "srd-5.1-2014",
  version: "5.1",
  spellPages: [114, 203]
};

describe("official SRD spell parser", () => {
  it("parses modern cantrips and separates cantrip upgrades", () => {
    const records = parseSpells({
      source: modernSource,
      text: `Acid Splash\nEvocation Cantrip (Sorcerer, Wizard)\nCasting Time: Action\nRange: 60 feet\nComponents: V, S\nDuration: Instantaneous\nYou create an acidic bubble at a point within range, where it explodes in a 5-foot-radius Sphere.\nCantrip Upgrade. The damage increases by 1d6.\n\nAid\nLevel 2 Abjuration (Bard, Cleric)\nCasting Time: Action\nRange: 30 feet\nComponents: V, S, M\nDuration: 8 hours\nChoose up to three creatures within range and increase their Hit Points.`
    });

    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      name: "Acid Splash",
      level: 0,
      school: "Evocation",
      classes: ["Sorcerer", "Wizard"]
    });
    expect(records[0].description).toContain("5-foot-radius Sphere");
    expect(records[0].higherLevels).toContain("Cantrip Upgrade");
  });

  it("parses legacy spell descriptors without blending editions", () => {
    const records = parseSpells({
      source: legacySource,
      text: `Acid Splash\nConjuration cantrip\nCasting Time: 1 action\nRange: 60 feet\nComponents: V, S\nDuration: Instantaneous\nChoose one creature, or choose two creatures within 5 feet of each other. Each target makes a Dexterity saving throw.\n\nAid\n2nd-level abjuration\nCasting Time: 1 action\nRange: 30 feet\nComponents: V, S, M\nDuration: 8 hours\nThree creatures gain additional hit points for the duration.`
    });

    expect(records.map((record) => record.name)).toEqual(["Acid Splash", "Aid"]);
    expect(records[0]).toMatchObject({ level: 0, school: "Conjuration" });
    expect(records[0].description).toContain("two creatures");
  });
});
