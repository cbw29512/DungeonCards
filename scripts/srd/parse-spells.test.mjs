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

  it("parses legacy descriptors and wrapped component fields", () => {
    const records = parseSpells({
      source: legacySource,
      text: `Acid Arrow\n2nd-\u00ad\u2010\u2011level evocation\nCasting Time: 1 action\nRange: 90 feet\nComponents: V, S, M (powdered rhubarb leaf and an\nadder's stomach)\nDuration: Instantaneous\nA shimmering arrow deals dam-\nage to the target.\n\nAcid Splash\nConjuration cantrip\nCasting Time: 1 action\nRange: 60 feet\nComponents: V, S\nDuration: Instantaneous\nChoose one creature, or choose two creatures within 5 feet of each other.`
    });

    expect(records.map((record) => record.name)).toEqual(["Acid Arrow", "Acid Splash"]);
    expect(records[0]).toMatchObject({
      level: 2,
      school: "evocation",
      components: "V, S, M (powdered rhubarb leaf and an adder's stomach)"
    });
    expect(records[0].description).toContain("deals damage");
    expect(records[1].description).toContain("two creatures");
  });

  it("collects wrapped modern class lists", () => {
    const records = parseSpells({
      source: modernSource,
      text: `Example Spell\nLevel 1 Divination (Bard, Cleric, Druid, Ranger,\nSorcerer, Warlock, Wizard)\nCasting Time: Action\nRange: Self\nComponents: V\nDuration: Instantaneous\nYou learn one useful fact.`
    });

    expect(records[0].classes).toEqual([
      "Bard", "Cleric", "Druid", "Ranger", "Sorcerer", "Warlock", "Wizard"
    ]);
  });
});
