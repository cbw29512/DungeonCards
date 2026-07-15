import manifestJson from "../generated/srd-manifest.json";
import monstersJson from "../generated/srd-monsters.json";
import spellsJson from "../generated/srd-spells.json";
import type {
  SrdManifest,
  SrdMonsterRecord,
  SrdSpellRecord
} from "../types/srdCompendium";

export const srdSpells = spellsJson as SrdSpellRecord[];
export const srdMonsters = monstersJson as SrdMonsterRecord[];
export const srdManifest = manifestJson as SrdManifest;
