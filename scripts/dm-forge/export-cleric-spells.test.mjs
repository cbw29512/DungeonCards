import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { buildClericSpellExport } from "./export-cleric-spells.mjs";

const spells = JSON.parse(await readFile(new URL("../../src/generated/srd-spells.json", import.meta.url), "utf8"));
const manifest = JSON.parse(await readFile(new URL("../../src/generated/srd-manifest.json", import.meta.url), "utf8"));

describe("Cleric in a Box spell reference export", () => {
  it("exports every exact-level spell for both supported rulesets", () => {
    const payload = buildClericSpellExport(spells, manifest);
    expect(payload.schemaVersion).toBe(1);
    expect(payload.recordCount).toBe(199);
    expect(payload.rulesets).toEqual({ 2014: 98, 2024: 101 });
    expect(payload.spells.every((spell) => spell.description && spell.castingTime && spell.range && spell.duration)).toBe(true);
  });

  it("keeps source and license information on every record", () => {
    const payload = buildClericSpellExport(spells, manifest);
    expect(payload.spells.every((spell) => spell.sourceReference && spell.sourceUrl)).toBe(true);
    expect(new Set(payload.spells.map((spell) => spell.license))).toEqual(new Set(["CC BY 4.0"]));
  });
});
