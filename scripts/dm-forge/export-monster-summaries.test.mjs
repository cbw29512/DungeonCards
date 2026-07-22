import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildExport,
  parseArmorClass,
  parseChallenge,
  parseDexterity,
  parseHitPoints,
  publicRuleset,
  summarizeMonster
} from "./export-monster-summaries.mjs";

const root = resolve(import.meta.dirname, "../..");
const monsters = JSON.parse(await readFile(resolve(root, "src/generated/srd-monsters.json"), "utf8"));
const manifest = JSON.parse(await readFile(resolve(root, "src/generated/srd-manifest.json"), "utf8"));

describe("DM Forge monster summary export", () => {
  it("parses combat values without discarding their original source text", () => {
    expect(parseArmorClass("19 (natural armor)")).toBe(19);
    expect(parseHitPoints("195 (17d12 + 85)")).toBe(195);
    expect(parseChallenge("14 (11,500 XP)")).toEqual({ challengeRating: "14", xp: 11500 });
    expect(parseChallenge("1/4 (50 XP)")).toEqual({ challengeRating: "1/4", xp: 50 });
    expect(parseDexterity("STR DEX CON INT WIS CHA 23 (+6) 14 (+2) 21 (+5) 14 (+2) 13 (+1) 17 (+3)")).toEqual({ dexterity: 14, dexterityModifier: 2 });
  });

  it("maps only the two verified SRD editions into DM Forge ruleset IDs", () => {
    expect(publicRuleset("srd-5.1-2014")).toBe("2014");
    expect(publicRuleset("srd-5.2.1-2024")).toBe("2024");
    expect(() => publicRuleset("homebrew")).toThrow(/Unsupported SRD edition/);
  });

  it("summarizes every generated monster with required encounter fields", () => {
    const summaries = monsters.map(summarizeMonster);
    expect(summaries).toHaveLength(642);
    expect(new Set(summaries.map((monster) => monster.id)).size).toBe(642);
    expect(summaries.filter((monster) => monster.ruleset === "2014")).toHaveLength(314);
    expect(summaries.filter((monster) => monster.ruleset === "2024")).toHaveLength(328);

    for (const monster of summaries) {
      expect(monster.name.length).toBeGreaterThan(0);
      expect(monster.type.length).toBeGreaterThan(0);
      expect(monster.armorClass).toBeGreaterThanOrEqual(0);
      expect(monster.hitPoints).toBeGreaterThanOrEqual(0);
      expect(monster.dexterity).toBeGreaterThanOrEqual(1);
      expect(monster.dexterityModifier).toBeGreaterThanOrEqual(-5);
      expect(monster.dexterityModifier).toBeLessThanOrEqual(10);
      expect(monster.sourcePage).toBeGreaterThan(0);
      expect(monster.sourceReference).toMatch(/^SRD 5\.(?:1|2\.1) p\. /);
    }
  });

  it("builds a deterministic licensed export that matches the source manifest", () => {
    const payload = buildExport(monsters, manifest);
    expect(payload.schemaVersion).toBe(1);
    expect(payload.recordCount).toBe(642);
    expect(payload.monsters).toHaveLength(642);
    expect(payload.sources).toHaveLength(2);
    expect(payload.sources.map((source) => source.monsterCount)).toEqual([314, 328]);
    for (const source of payload.sources) {
      expect(source.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(source.license).toBe("CC BY 4.0");
      expect(source.attribution).toMatch(/Creative Commons Attribution 4\.0/);
    }
    expect(JSON.stringify(buildExport(monsters, manifest))).toBe(JSON.stringify(payload));
  });
});
