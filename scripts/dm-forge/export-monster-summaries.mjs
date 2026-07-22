import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const monsterSourcePath = resolve(projectRoot, "src/generated/srd-monsters.json");
const manifestSourcePath = resolve(projectRoot, "src/generated/srd-manifest.json");
const outputPath = resolve(projectRoot, "public/dm-forge/srd-monster-summaries.json");

export const EXPORT_SCHEMA_VERSION = 1;

function requiredInteger(value, label, minimum = 0) {
  const number = Number.parseInt(String(value), 10);
  if (!Number.isInteger(number) || number < minimum) throw new Error(`Could not parse ${label}: ${value}`);
  return number;
}

export function publicRuleset(edition) {
  if (edition === "srd-5.1-2014") return "2014";
  if (edition === "srd-5.2.1-2024") return "2024";
  throw new Error(`Unsupported SRD edition: ${edition}`);
}

export function parseArmorClass(value) {
  const match = String(value || "").match(/^\s*(\d+)/);
  return requiredInteger(match?.[1], "armor class", 0);
}

export function parseHitPoints(value) {
  const match = String(value || "").match(/^\s*(\d+)/);
  return requiredInteger(match?.[1], "hit points", 0);
}

export function parseChallenge(value) {
  const text = String(value || "").trim();
  const ratingMatch = text.match(/^(0|1\/8|1\/4|1\/2|\d+)/);
  if (!ratingMatch) throw new Error(`Could not parse challenge rating: ${value}`);
  const xpMatch = text.match(/\(([\d,]+)\s+XP\)/i);
  return {
    challengeRating: ratingMatch[1],
    xp: xpMatch ? requiredInteger(xpMatch[1].replaceAll(",", ""), "challenge XP", 0) : 0
  };
}

export function parseDexterity(rawText) {
  const normalized = String(rawText || "").replace(/\s+/g, " ");
  const match = normalized.match(/STR\s+DEX\s+CON\s+INT\s+WIS\s+CHA\s+\d+\s+\([^)]+\)\s+(\d+)\s+\(([+-]\d+)\)/i);
  if (!match) throw new Error("Could not parse Dexterity score and modifier from the SRD stat block.");
  return {
    dexterity: requiredInteger(match[1], "Dexterity score", 1),
    dexterityModifier: Number.parseInt(match[2], 10)
  };
}

export function summarizeMonster(monster) {
  if (!monster || typeof monster !== "object") throw new Error("Monster record must be an object.");
  const challenge = parseChallenge(monster.challenge);
  const dexterity = parseDexterity(monster.rawText);
  return {
    id: String(monster.id),
    ruleset: publicRuleset(monster.edition),
    edition: String(monster.edition),
    sourceVersion: String(monster.sourceVersion),
    name: String(monster.name),
    size: String(monster.size),
    type: String(monster.type),
    alignment: String(monster.alignment),
    armorClass: parseArmorClass(monster.armorClass),
    armorClassText: String(monster.armorClass),
    hitPoints: parseHitPoints(monster.hitPoints),
    hitPointsText: String(monster.hitPoints),
    speed: String(monster.speed),
    challengeRating: challenge.challengeRating,
    xp: challenge.xp,
    dexterity: dexterity.dexterity,
    dexterityModifier: dexterity.dexterityModifier,
    legendary: Boolean(String(monster.legendaryActions || "").trim()),
    sourcePage: requiredInteger(monster.sourcePage, "source page", 1),
    sourceReference: String(monster.sourceReference)
  };
}

export function buildExport(monsters, manifest) {
  if (!Array.isArray(monsters)) throw new Error("SRD monster source must be an array.");
  if (manifest?.schemaVersion !== 1 || !Array.isArray(manifest.sources)) throw new Error("Unsupported SRD manifest.");

  const summaries = monsters.map(summarizeMonster);
  const ids = new Set(summaries.map((monster) => monster.id));
  if (ids.size !== summaries.length) throw new Error("Monster summary export contains duplicate IDs.");

  const expectedCount = manifest.sources.reduce((sum, source) => sum + Number(source.monsterCount || 0), 0);
  if (summaries.length !== expectedCount) {
    throw new Error(`Monster summary count ${summaries.length} does not match manifest count ${expectedCount}.`);
  }

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    generatedBy: "scripts/dm-forge/export-monster-summaries.mjs",
    sourceManifestSchemaVersion: manifest.schemaVersion,
    recordCount: summaries.length,
    sources: manifest.sources.map((source) => ({
      edition: source.edition,
      version: source.version,
      pdfUrl: source.pdfUrl,
      sha256: source.sha256,
      attribution: source.attribution,
      monsterCount: source.monsterCount,
      license: "CC BY 4.0"
    })),
    monsters: summaries
  };
}

export async function exportMonsterSummaries() {
  const [monsterJson, manifestJson] = await Promise.all([
    readFile(monsterSourcePath, "utf8"),
    readFile(manifestSourcePath, "utf8")
  ]);
  const payload = buildExport(JSON.parse(monsterJson), JSON.parse(manifestJson));
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = await exportMonsterSummaries();
  console.log(`Exported ${payload.recordCount} DM Forge monster summaries to ${outputPath}`);
}
