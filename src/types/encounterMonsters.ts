import type { MonsterCardData, MonsterRuleset } from "./monsters";
import type { SrdMonsterRecord } from "./srdCompendium";

export type EncounterMonsterEntry = {
  id: string;
  name: string;
  ruleset: MonsterRuleset;
  cr: string;
  type: string;
  size: string;
  source: string;
} & (
  | { kind: "formatted"; monster: MonsterCardData }
  | { kind: "reference"; monster: SrdMonsterRecord }
);
