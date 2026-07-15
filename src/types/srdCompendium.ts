import type { RulesetId } from "./ruleCards";

export type SrdSpellRecord = {
  id: string;
  edition: RulesetId;
  sourceVersion: string;
  name: string;
  level: number;
  school: string;
  classes: string[];
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  higherLevels: string;
  sourcePage: number;
  sourceReference: string;
};

export type SrdMonsterRecord = {
  id: string;
  edition: RulesetId;
  sourceVersion: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  armorClass: string;
  hitPoints: string;
  speed: string;
  challenge: string;
  traits: string;
  actions: string;
  bonusActions: string;
  reactions: string;
  legendaryActions: string;
  rawText: string;
  sourcePage: number;
  sourceReference: string;
};

export type SrdManifest = {
  schemaVersion: 1;
  generatedBy: string;
  sources: Array<{
    edition: RulesetId;
    version: string;
    pdfUrl: string;
    sha256: string;
    attribution: string;
    spellCount: number;
    monsterCount: number;
  }>;
};
