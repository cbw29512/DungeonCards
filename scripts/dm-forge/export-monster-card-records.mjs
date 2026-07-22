import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const monsterSourcePath = resolve(projectRoot, "src/generated/srd-monsters.json");
const manifestSourcePath = resolve(projectRoot, "src/generated/srd-manifest.json");
const exportRoot = resolve(projectRoot, "public/dm-forge/monster-cards");
const recordsRoot = resolve(exportRoot, "records");
const indexPath = resolve(exportRoot, "index.json");

export const MONSTER_CARD_EXPORT_SCHEMA_VERSION = 1;

function cleanText(value, label, maximum = 200000) {
  const text = String(value ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
  if (!text) throw new Error(`Monster card export is missing ${label}.`);
  return text.slice(0, maximum);
}

function optionalText(value, maximum = 200000) {
  return String(value ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, maximum);
}

function requiredInteger(value, label, minimum = 0) {
  const number = Number.parseInt(String(value), 10);
  if (!Number.isInteger(number) || number < minimum) throw new Error(`Monster card export has an invalid ${label}: ${value}`);
  return number;
}

function safeRecordName(id) {
  const name = cleanText(id, "record ID", 180);
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(name)) throw new Error(`Monster card record ID is not path-safe: ${name}`);
  return `${name}.json`;
}

function rulesetFor(edition) {
  if (edition === "srd-5.1-2014") return "5e-2014";
  if (edition === "srd-5.2.1-2024") return "5e-2024";
  throw new Error(`Unsupported monster card edition: ${edition}`);
}

function sourceFor(monster, manifest) {
  const source = manifest.sources.find((entry) => entry.edition === monster.edition);
  if (!source) throw new Error(`No manifest source for ${monster.id}.`);
  if (!/^[a-f0-9]{64}$/i.test(String(source.sha256 || ""))) throw new Error(`Source digest missing for ${monster.id}.`);
  return {
    edition: cleanText(source.edition, "source edition", 40),
    version: cleanText(source.version, "source version", 20),
    pdfUrl: cleanText(source.pdfUrl, "source PDF URL", 1000),
    sha256: source.sha256,
    attribution: cleanText(source.attribution, "source attribution", 2000),
    license: "CC BY 4.0"
  };
}

export function buildMonsterCardRecord(monster, manifest) {
  if (!monster || typeof monster !== "object") throw new Error("Monster card source record must be an object.");
  const source = sourceFor(monster, manifest);
  const id = cleanText(monster.id, "record ID", 180);
  const recordPath = `records/${safeRecordName(id)}`;

  return {
    schemaVersion: MONSTER_CARD_EXPORT_SCHEMA_VERSION,
    id,
    recordPath,
    ruleset: rulesetFor(monster.edition),
    edition: source.edition,
    sourceVersion: source.version,
    sourcePage: requiredInteger(monster.sourcePage, "source page", 1),
    sourceReference: cleanText(monster.sourceReference, "source reference", 160),
    source,
    identity: {
      name: cleanText(monster.name, "name", 180),
      size: cleanText(monster.size, "size", 80),
      type: cleanText(monster.type, "type", 120),
      alignment: cleanText(monster.alignment, "alignment", 160),
      challenge: cleanText(monster.challenge, "challenge", 120)
    },
    combat: {
      armorClass: cleanText(monster.armorClass, "Armor Class", 240),
      hitPoints: cleanText(monster.hitPoints, "Hit Points", 240),
      speed: cleanText(monster.speed, "speed", 400),
      initiative: optionalText(monster.initiative, 120),
      abilities: optionalText(monster.abilities, 2000),
      saves: optionalText(monster.saves, 2000),
      skills: optionalText(monster.skills, 3000),
      vulnerabilities: optionalText(monster.vulnerabilities, 2000),
      resistances: optionalText(monster.resistances, 3000),
      immunities: optionalText(monster.immunities, 3000),
      gear: optionalText(monster.gear, 5000),
      senses: optionalText(monster.senses, 2000),
      languages: optionalText(monster.languages, 2000)
    },
    sections: {
      traits: optionalText(monster.traits),
      actions: optionalText(monster.actions),
      bonusActions: optionalText(monster.bonusActions),
      reactions: optionalText(monster.reactions),
      legendaryActions: optionalText(monster.legendaryActions),
      spells: optionalText(monster.spells)
    },
    rawText: cleanText(monster.rawText, "complete stat block"),
    scope: {
      contentClass: "verified-srd-reference",
      automation: "reference-complete",
      note: "Complete generated SRD reference record. Structured roll automation is not implied unless separately documented and tested."
    }
  };
}

export function buildMonsterCardIndex(monsters, manifest) {
  if (!Array.isArray(monsters)) throw new Error("Monster card source must be an array.");
  if (manifest?.schemaVersion !== 1 || !Array.isArray(manifest.sources)) throw new Error("Unsupported SRD manifest.");

  const failures = [];
  const records = monsters.flatMap((monster) => {
    try { return [buildMonsterCardRecord(monster, manifest)]; }
    catch (error) {
      failures.push(`${monster?.id || monster?.name || "unknown monster"}: ${error.message}`);
      return [];
    }
  });
  if (failures.length) throw new Error(`Full monster card export rejected ${failures.length} record(s):\n${failures.join("\n")}`);

  const ids = new Set(records.map((record) => record.id));
  if (ids.size !== records.length) throw new Error("Full monster card export contains duplicate IDs.");

  const expectedCount = manifest.sources.reduce((sum, source) => sum + Number(source.monsterCount || 0), 0);
  if (records.length !== expectedCount) throw new Error(`Full monster card count ${records.length} does not match manifest count ${expectedCount}.`);

  const index = records.map((record) => ({
    id: record.id,
    recordPath: record.recordPath,
    ruleset: record.ruleset,
    edition: record.edition,
    sourceVersion: record.sourceVersion,
    sourcePage: record.sourcePage,
    sourceReference: record.sourceReference,
    name: record.identity.name,
    size: record.identity.size,
    type: record.identity.type,
    alignment: record.identity.alignment,
    challenge: record.identity.challenge,
    armorClass: record.combat.armorClass,
    hitPoints: record.combat.hitPoints,
    speed: record.combat.speed,
    contentClass: record.scope.contentClass,
    automation: record.scope.automation
  }));

  return {
    indexPayload: {
      schemaVersion: MONSTER_CARD_EXPORT_SCHEMA_VERSION,
      generatedBy: "scripts/dm-forge/export-monster-card-records.mjs",
      recordCount: index.length,
      sources: manifest.sources.map((source) => ({
        edition: source.edition,
        version: source.version,
        pdfUrl: source.pdfUrl,
        sha256: source.sha256,
        attribution: source.attribution,
        monsterCount: source.monsterCount,
        license: "CC BY 4.0"
      })),
      records: index
    },
    records
  };
}

export async function exportMonsterCardRecords() {
  const [monsterJson, manifestJson] = await Promise.all([
    readFile(monsterSourcePath, "utf8"),
    readFile(manifestSourcePath, "utf8")
  ]);
  const { indexPayload, records } = buildMonsterCardIndex(JSON.parse(monsterJson), JSON.parse(manifestJson));

  await rm(exportRoot, { recursive: true, force: true });
  await mkdir(recordsRoot, { recursive: true });
  await writeFile(indexPath, `${JSON.stringify(indexPayload, null, 2)}\n`, "utf8");
  await Promise.all(records.map((record) => writeFile(
    resolve(exportRoot, record.recordPath),
    `${JSON.stringify(record, null, 2)}\n`,
    "utf8"
  )));
  return indexPayload;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = await exportMonsterCardRecords();
  console.log(`Exported ${payload.recordCount} lazy DM Forge monster card records to ${exportRoot}`);
}
