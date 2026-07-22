import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildMonsterCardIndex,
  buildMonsterCardRecord,
  MONSTER_CARD_EXPORT_SCHEMA_VERSION
} from "./export-monster-card-records.mjs";

const root = resolve(import.meta.dirname, "../..");
const monsters = JSON.parse(await readFile(resolve(root, "src/generated/srd-monsters.json"), "utf8"));
const manifest = JSON.parse(await readFile(resolve(root, "src/generated/srd-manifest.json"), "utf8"));

describe("DM Forge lazy full-stat monster card export", () => {
  it("builds one complete source-traceable record for every generated monster", () => {
    const { indexPayload, records } = buildMonsterCardIndex(monsters, manifest);
    expect(indexPayload.schemaVersion).toBe(MONSTER_CARD_EXPORT_SCHEMA_VERSION);
    expect(indexPayload.recordCount).toBe(642);
    expect(indexPayload.records).toHaveLength(642);
    expect(records).toHaveLength(642);
    expect(new Set(records.map((record) => record.id)).size).toBe(642);
    expect(records.filter((record) => record.ruleset === "5e-2014")).toHaveLength(314);
    expect(records.filter((record) => record.ruleset === "5e-2024")).toHaveLength(328);

    for (const record of records) {
      expect(record.recordPath).toBe(`records/${record.id}.json`);
      expect(record.recordPath).toMatch(/^records\/[a-z0-9][a-z0-9-]*\.json$/i);
      expect(record.identity.name.length).toBeGreaterThan(0);
      expect(record.identity.challenge.length).toBeGreaterThan(0);
      expect(record.combat.armorClass.length).toBeGreaterThan(0);
      expect(record.combat.hitPoints.length).toBeGreaterThan(0);
      expect(record.combat.speed.length).toBeGreaterThan(0);
      expect(record.rawText.length).toBeGreaterThan(0);
      expect(record.sourceReference).toMatch(/^SRD 5\.(?:1|2\.1) p\. /);
      expect(record.source.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(record.source.license).toBe("CC BY 4.0");
      expect(record.scope.contentClass).toBe("verified-srd-reference");
      expect(record.scope.automation).toBe("reference-complete");
      expect(record.scope.note).toMatch(/automation is not implied/i);
    }
  });

  it("keeps the index compact and points to lazy records instead of embedding complete stat blocks", () => {
    const { indexPayload } = buildMonsterCardIndex(monsters, manifest);
    for (const entry of indexPayload.records) {
      expect(entry.recordPath).toMatch(/^records\//);
      expect(entry).not.toHaveProperty("rawText");
      expect(entry).not.toHaveProperty("sections");
      expect(entry).not.toHaveProperty("source");
    }
    const serialized = JSON.stringify(indexPayload);
    expect(serialized).not.toContain('"rawText"');
    expect(serialized.length).toBeLessThan(1_000_000);
  });

  it("preserves all named full-reference sections without inventing automation", () => {
    const spellcaster = monsters.find((monster) => monster.spells?.trim());
    const legendary = monsters.find((monster) => monster.legendaryActions?.trim());
    const reactions = monsters.find((monster) => monster.reactions?.trim());
    expect(spellcaster).toBeTruthy();
    expect(legendary).toBeTruthy();
    expect(reactions).toBeTruthy();

    const spellRecord = buildMonsterCardRecord(spellcaster, manifest);
    const legendaryRecord = buildMonsterCardRecord(legendary, manifest);
    const reactionRecord = buildMonsterCardRecord(reactions, manifest);
    expect(spellRecord.sections.spells.length).toBeGreaterThan(0);
    expect(legendaryRecord.sections.legendaryActions.length).toBeGreaterThan(0);
    expect(reactionRecord.sections.reactions.length).toBeGreaterThan(0);
    expect(spellRecord.scope.automation).toBe("reference-complete");
  });

  it("is deterministic and agrees with the manifest source counts", () => {
    const first = buildMonsterCardIndex(monsters, manifest);
    const second = buildMonsterCardIndex(monsters, manifest);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(first.indexPayload.sources.map((source) => source.monsterCount)).toEqual([314, 328]);
    expect(first.indexPayload.sources.every((source) => source.license === "CC BY 4.0")).toBe(true);
  });

  it("rejects path-unsafe IDs and unsupported editions", () => {
    const source = monsters[0];
    expect(() => buildMonsterCardRecord({ ...source, id: "../escape" }, manifest)).toThrow(/path-safe/);
    expect(() => buildMonsterCardRecord({ ...source, edition: "homebrew" }, manifest)).toThrow(/No manifest source|Unsupported/);
  });
});
