import { describe, expect, it } from "vitest";
import { srdManifest, srdMonsters, srdSpells } from "../data/srdCompendium";
import type { RulesetId } from "../types/ruleCards";

const expected = {
  "srd-5.1-2014": { spells: 319, monsters: 314 },
  "srd-5.2.1-2024": { spells: 339, monsters: 328 }
} satisfies Record<RulesetId, { spells: number; monsters: number }>;

describe("exact SRD catalog completeness", () => {
  it("matches the reviewed extraction count for each official edition", () => {
    for (const [edition, counts] of Object.entries(expected) as Array<[RulesetId, typeof expected[RulesetId]]>) {
      expect(srdSpells.filter((record) => record.edition === edition)).toHaveLength(counts.spells);
      expect(srdMonsters.filter((record) => record.edition === edition)).toHaveLength(counts.monsters);
      const source = srdManifest.sources.find((candidate) => candidate.edition === edition);
      expect(source).toMatchObject({
        spellCount: counts.spells,
        monsterCount: counts.monsters
      });
    }
  });

  it("keeps every monster unique and backed by a complete source record", () => {
    expect(new Set(srdMonsters.map((monster) => monster.id)).size).toBe(srdMonsters.length);
    expect(new Set(srdMonsters.map((monster) => `${monster.edition}:${monster.name}`)).size).toBe(srdMonsters.length);

    for (const monster of srdMonsters) {
      expect(monster.rawText.trim().length, `${monster.id} raw source text`).toBeGreaterThan(80);
      expect(monster.sourcePage, `${monster.id} source page`).toBeGreaterThan(0);
      expect(monster.sourceReference.trim(), `${monster.id} source reference`).not.toBe("");
      expect(monster.armorClass.trim(), `${monster.id} Armor Class`).not.toBe("");
      expect(monster.hitPoints.trim(), `${monster.id} Hit Points`).not.toBe("");
      expect(monster.speed.trim(), `${monster.id} Speed`).not.toBe("");
      expect(monster.challenge.trim(), `${monster.id} Challenge Rating`).not.toBe("");
    }
  });
});