import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { generatedPaths, srdSources } from "./source-config.mjs";
import { parseMonsters } from "./parse-monsters.mjs";
import { parseSpells } from "./parse-spells.mjs";
import { validateCatalogs } from "./validate.mjs";

const download = async (url, destination) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Downloading ${url} failed with ${response.status}.`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(destination, bytes);
  return createHash("sha256").update(bytes).digest("hex");
};

const extractRange = (pdfPath, [firstPage, lastPage], outputPath) => {
  try {
    execFileSync("pdftotext", [
      "-raw",
      "-f", String(firstPage),
      "-l", String(lastPage),
      pdfPath,
      outputPath
    ], { stdio: "inherit" });
  } catch (error) {
    console.error("Extracting an SRD PDF range failed", {
      pdfPath,
      firstPage,
      lastPage,
      error
    });
    throw error;
  }
};

const writeJson = async (path, value) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const writeGeneratedFiles = async (spells, monsters, sourceManifest) => {
  await writeJson(generatedPaths.spells, spells);
  await writeJson(generatedPaths.monsters, monsters);
  await writeJson(generatedPaths.manifest, {
    schemaVersion: 1,
    generatedBy: "scripts/srd/sync.mjs",
    sources: sourceManifest
  });
};

const run = async () => {
  const workspace = join(tmpdir(), "dungeon-cards-srd-sync");
  await mkdir(workspace, { recursive: true });
  const spells = [];
  const monsters = [];
  const sourceManifest = [];

  for (const source of srdSources) {
    const pdfPath = join(workspace, `srd-${source.version}.pdf`);
    const spellTextPath = join(workspace, `spells-${source.version}.txt`);
    const monsterTextPath = join(workspace, `monsters-${source.version}.txt`);
    const sha256 = await download(source.pdfUrl, pdfPath);
    extractRange(pdfPath, source.spellPages, spellTextPath);
    extractRange(pdfPath, source.monsterPages, monsterTextPath);

    const sourceSpells = parseSpells({
      text: await readFile(spellTextPath, "utf8"),
      source
    });
    const sourceMonsters = parseMonsters({
      text: await readFile(monsterTextPath, "utf8"),
      source
    });

    console.log("Parsed official SRD source", {
      edition: source.edition,
      spellCount: sourceSpells.length,
      monsterCount: sourceMonsters.length,
      firstSpells: sourceSpells.slice(0, 5).map((record) => record.name),
      lastSpells: sourceSpells.slice(-5).map((record) => record.name),
      firstMonsters: sourceMonsters.slice(0, 5).map((record) => record.name),
      lastMonsters: sourceMonsters.slice(-5).map((record) => record.name)
    });

    spells.push(...sourceSpells);
    monsters.push(...sourceMonsters);
    sourceManifest.push({
      edition: source.edition,
      version: source.version,
      pdfUrl: source.pdfUrl,
      sha256,
      attribution: source.attribution,
      spellCount: sourceSpells.length,
      monsterCount: sourceMonsters.length
    });
  }

  await writeGeneratedFiles(spells, monsters, sourceManifest);
  validateCatalogs({ spells, monsters, manifest: sourceManifest });
  console.log(`Generated ${spells.length} spell records and ${monsters.length} monster records.`);
};

run().catch((error) => {
  console.error("Synchronizing official SRD catalogs failed", { error });
  process.exitCode = 1;
});
