import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sheet = readFileSync("src/components/DndPregenCharacterSheet.tsx", "utf8");
const catalog = readFileSync("src/data/dndReadyPregens.ts", "utf8");
const coverage = readFileSync("src/data/rulesCoverageDnd.ts", "utf8");

assert.match(sheet, /dndSpellSaveDc/);
assert.match(sheet, /dndSpellAttackBonus/);
assert.match(sheet, /Prepared Spells/);
assert.match(sheet, /Known Spells/);
assert.match(sheet, /Spell slots/);

assert.match(catalog, /dndBardPregenRecords/);
assert.match(catalog, /\.\.\.dndBardPregenRecords/);

assert.match(coverage, /Bard \/ College of Lore ready-to-play pregens/);
assert.match(coverage, /120 validated/);
assert.match(coverage, /360 visible Blueprints/);

console.log("D&D Bard pregen release contract passed.");
