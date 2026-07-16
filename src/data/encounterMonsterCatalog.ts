import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { MonsterCardData } from "../types/monsters";
import { monsterCatalog } from "./monsterCatalog";
import { srdMonsters } from "./srdCompendium";

const monsterKey = (ruleset: string, name: string) =>
  `${ruleset}:${name.trim().toLowerCase()}`;

const formattedKeys = new Set(
  monsterCatalog.map((monster) => monsterKey(monster.ruleset, monster.name))
);

const formattedEntries: EncounterMonsterEntry[] = monsterCatalog.map((monster) => ({
  id: monster.id,
  kind: "formatted",
  name: monster.name,
  ruleset: monster.ruleset,
  cr: monster.cr,
  type: monster.type,
  size: monster.size,
  source: monster.source,
  monster
}));

const generatedEntries: EncounterMonsterEntry[] = srdMonsters
  .filter((monster) => !formattedKeys.has(monsterKey(monster.edition, monster.name)))
  .map((monster) => ({
    id: monster.id,
    kind: "reference",
    name: monster.name,
    ruleset: monster.edition,
    cr: monster.challenge,
    type: monster.type,
    size: monster.size,
    source: monster.sourceReference,
    monster
  }));

export const encounterMonsterCatalog: EncounterMonsterEntry[] = [
  ...formattedEntries,
  ...generatedEntries
].sort((left, right) => (
  left.name.localeCompare(right.name)
  || left.ruleset.localeCompare(right.ruleset)
));

export const createHomebrewEncounterEntry = (
  monster: MonsterCardData
): EncounterMonsterEntry => ({
  id: monster.id,
  kind: "formatted",
  name: monster.name,
  ruleset: monster.ruleset,
  cr: monster.cr,
  type: monster.type,
  size: monster.size,
  source: monster.source,
  monster
});
