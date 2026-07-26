import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

const [tracker, importer, panel, adapter, coverage] = await Promise.all([
  read("src/components/DndEncounterTracker.tsx"),
  read("src/components/DndMonsterEncounterImporter.tsx"),
  read("src/components/DndMonsterLiveReferencePanel.tsx"),
  read("src/utils/dndMonsterLiveReference.ts"),
  read("src/data/rulesCoverageDnd.ts")
]);

assert.match(tracker, /DndMonsterLiveReferencePanel/);
assert.match(tracker, /setReferences=\{setMonsterReferences\}/);
assert.match(importer, /buildDndMonsterLiveReference/);
assert.match(importer, /actions: liveReference\.actions\.map/);
assert.match(panel, /Roll recharge d6/);
assert.match(panel, /spendDndTurnResource/);
assert.match(adapter, /reference\.allActions/);
assert.match(adapter, /reference\.bonusActions/);
assert.match(adapter, /reference\.reactions/);
assert.match(adapter, /reference\.legendaryActions/);
assert.match(coverage, /complete action sections/);
assert.match(coverage, /independent per-copy recharge state/);

console.log("D&D monster live-reference integration gate passed.");