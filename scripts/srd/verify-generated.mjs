import { readFile } from "node:fs/promises";
import { generatedPaths } from "./source-config.mjs";
import { validateCatalogs } from "./validate.mjs";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const run = async () => {
  const [spells, monsters, manifest] = await Promise.all([
    readJson(generatedPaths.spells),
    readJson(generatedPaths.monsters),
    readJson(generatedPaths.manifest)
  ]);
  validateCatalogs({ spells, monsters, manifest: manifest.sources });
  console.log(`Verified ${spells.length} spells and ${monsters.length} monsters.`);
};

run().catch((error) => {
  console.error("Verifying committed SRD catalogs failed", { error });
  process.exitCode = 1;
});
