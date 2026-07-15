import { describe, expect, it } from "vitest";
import { parseMonsters } from "./parse-monsters.mjs";

const source = {
  edition: "srd-5.2.1-2024",
  version: "5.2.1",
  monsterPages: [258, 364]
};

describe("official SRD monster parser", () => {
  it("parses consecutive stat blocks and their core values", () => {
    const records = parseMonsters({
      source,
      text: `Goblin Minion\nSmall Fey, Neutral Evil\nArmor Class 15\nHit Points 7 (2d6)\nSpeed 30 ft.\nChallenge 1/4 (50 XP)\nTraits\nNimble Escape. The goblin moves quickly.\nActions\nScimitar. Melee Attack Roll: +4, reach 5 ft. Hit: 5 Slashing damage.\n\nAllosaurus\nLarge Beast, Unaligned\nArmor Class 13\nHit Points 51 (6d10 + 18)\nSpeed 60 ft.\nChallenge 2 (450 XP)\nActions\nBite. Melee Attack Roll: +6, reach 5 ft. Hit: 15 Piercing damage.`
    });

    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      name: "Allosaurus",
      size: "Large",
      type: "Beast",
      armorClass: "13",
      challenge: "2 (450 XP)"
    });
    expect(records[1]).toMatchObject({
      name: "Goblin Minion",
      size: "Small",
      type: "Fey",
      hitPoints: "7 (2d6)"
    });
    expect(records[1].actions).toContain("Scimitar");
  });
});
