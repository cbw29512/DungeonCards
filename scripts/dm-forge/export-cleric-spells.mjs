import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const spellSourcePath = resolve(projectRoot, "src/generated/srd-spells.json");
const manifestSourcePath = resolve(projectRoot, "src/generated/srd-manifest.json");
const outputPath = resolve(projectRoot, "public/dm-forge/cleric-spell-references.json");

export const CLERIC_SPELL_EXPORT_SCHEMA_VERSION = 1;

const SHARED = {
  1: ["Bane", "Bless", "Command", "Create or Destroy Water", "Cure Wounds", "Detect Evil and Good", "Detect Magic", "Detect Poison and Disease", "Guiding Bolt", "Healing Word", "Inflict Wounds", "Protection from Evil and Good", "Purify Food and Drink", "Sanctuary", "Shield of Faith"],
  2: ["Aid", "Augury", "Blindness/Deafness", "Calm Emotions", "Continual Flame", "Enhance Ability", "Find Traps", "Gentle Repose", "Hold Person", "Lesser Restoration", "Locate Object", "Prayer of Healing", "Protection from Poison", "Silence", "Spiritual Weapon", "Warding Bond", "Zone of Truth"],
  3: ["Animate Dead", "Beacon of Hope", "Bestow Curse", "Clairvoyance", "Create Food and Water", "Daylight", "Dispel Magic", "Glyph of Warding", "Magic Circle", "Mass Healing Word", "Meld into Stone", "Protection from Energy", "Remove Curse", "Revivify", "Sending", "Speak with Dead", "Spirit Guardians", "Tongues", "Water Walk"],
  5: ["Commune", "Contagion", "Dispel Evil and Good", "Flame Strike", "Geas", "Greater Restoration", "Hallow", "Insect Plague", "Legend Lore", "Mass Cure Wounds", "Planar Binding", "Raise Dead", "Scrying"],
  7: ["Conjure Celestial", "Divine Word", "Etherealness", "Fire Storm", "Plane Shift", "Regenerate", "Resurrection", "Symbol"],
  9: ["Astral Projection", "Gate", "Mass Heal", "True Resurrection"]
};

export const CLERIC_SPELLS = Object.freeze({
  2014: Object.freeze({
    1: SHARED[1], 2: SHARED[2], 3: SHARED[3],
    4: ["Banishment", "Control Water", "Death Ward", "Divination", "Freedom of Movement", "Guardian of Faith", "Locate Creature", "Stone Shape"],
    5: SHARED[5],
    6: ["Blade Barrier", "Create Undead", "Find the Path", "Forbiddance", "Harm", "Heal", "Heroes' Feast", "Planar Ally", "True Seeing", "Word of Recall"],
    7: SHARED[7],
    8: ["Antimagic Field", "Control Weather", "Earthquake", "Holy Aura"],
    9: SHARED[9]
  }),
  2024: Object.freeze({
    1: SHARED[1], 2: SHARED[2], 3: SHARED[3],
    4: ["Aura of Life", "Banishment", "Control Water", "Death Ward", "Divination", "Freedom of Movement", "Guardian of Faith", "Locate Creature", "Stone Shape"],
    5: SHARED[5],
    6: ["Blade Barrier", "Create Undead", "Find the Path", "Forbiddance", "Harm", "Heal", "Heroes' Feast", "Planar Ally", "Sunbeam", "True Seeing", "Word of Recall"],
    7: SHARED[7],
    8: ["Antimagic Field", "Control Weather", "Earthquake", "Holy Aura", "Sunburst"],
    9: SHARED[9]
  })
});

const normalizeName = (value) => String(value || "")
  .replace(/[’‘]/g, "'")
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();

const publicRuleset = (edition) => {
  if (edition === "srd-5.1-2014") return "2014";
  if (edition === "srd-5.2.1-2024") return "2024";
  throw new Error(`Unsupported SRD edition: ${edition}`);
};

const expectedByRuleset = (ruleset) => new Map(
  Object.entries(CLERIC_SPELLS[ruleset]).flatMap(([level, names]) => names.map((name) => [normalizeName(name), Number(level)]))
);

export function buildClericSpellExport(spells, manifest) {
  if (!Array.isArray(spells)) throw new Error("SRD spell source must be an array.");
  if (manifest?.schemaVersion !== 1 || !Array.isArray(manifest.sources)) throw new Error("Unsupported SRD manifest.");

  const sourceByEdition = new Map(manifest.sources.map((source) => [source.edition, source]));
  const records = [];

  for (const ruleset of ["2014", "2024"]) {
    const expected = expectedByRuleset(ruleset);
    const edition = ruleset === "2014" ? "srd-5.1-2014" : "srd-5.2.1-2024";
    const source = sourceByEdition.get(edition);
    if (!source) throw new Error(`Missing source manifest for ${edition}.`);

    const found = new Set();
    for (const spell of spells) {
      if (spell.edition !== edition) continue;
      const normalized = normalizeName(spell.name);
      const expectedLevel = expected.get(normalized);
      if (!expectedLevel) continue;
      if (Number(spell.level) !== expectedLevel) {
        throw new Error(`${spell.name} has level ${spell.level}; Cleric in a Box expects level ${expectedLevel} for ${ruleset}.`);
      }
      if (found.has(normalized)) throw new Error(`Duplicate ${ruleset} cleric spell: ${spell.name}.`);
      found.add(normalized);
      records.push({
        id: String(spell.id),
        ruleset,
        edition,
        sourceVersion: String(spell.sourceVersion),
        name: String(spell.name),
        level: Number(spell.level),
        school: String(spell.school || ""),
        castingTime: String(spell.castingTime || ""),
        range: String(spell.range || ""),
        components: String(spell.components || ""),
        duration: String(spell.duration || ""),
        description: String(spell.description || ""),
        higherLevels: String(spell.higherLevels || ""),
        sourcePage: Number(spell.sourcePage),
        sourceReference: String(spell.sourceReference),
        sourceUrl: String(source.pdfUrl),
        attribution: String(source.attribution),
        license: "CC BY 4.0"
      });
    }

    const missing = [...expected.entries()].filter(([name]) => !found.has(name)).map(([name]) => name);
    if (missing.length) throw new Error(`${ruleset} cleric export is missing ${missing.length} spell(s): ${missing.join(", ")}`);
  }

  records.sort((a, b) => Number(a.ruleset) - Number(b.ruleset) || a.level - b.level || a.name.localeCompare(b.name));
  const ids = new Set(records.map((record) => record.id));
  if (ids.size !== records.length) throw new Error("Cleric spell export contains duplicate record IDs.");

  return {
    schemaVersion: CLERIC_SPELL_EXPORT_SCHEMA_VERSION,
    generatedBy: "scripts/dm-forge/export-cleric-spells.mjs",
    policy: {
      exactLevelOnly: true,
      automaticUpcasting: false,
      contentLicense: "CC BY 4.0"
    },
    recordCount: records.length,
    rulesets: {
      2014: records.filter((record) => record.ruleset === "2014").length,
      2024: records.filter((record) => record.ruleset === "2024").length
    },
    spells: records
  };
}

export async function exportClericSpells() {
  const [spellJson, manifestJson] = await Promise.all([
    readFile(spellSourcePath, "utf8"),
    readFile(manifestSourcePath, "utf8")
  ]);
  const payload = buildClericSpellExport(JSON.parse(spellJson), JSON.parse(manifestJson));
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = await exportClericSpells();
  console.log(`Exported ${payload.recordCount} cast-ready cleric spell references to ${outputPath}`);
}
