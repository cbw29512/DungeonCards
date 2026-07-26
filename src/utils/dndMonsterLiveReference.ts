import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { MonsterItem } from "../types/monsters";
import { buildMonsterCombatReference, type MonsterCombatActionReference } from "./monsterCombatReference";
import { parseDndCreatureSize, type DndCreatureSize } from "./dndSpatialCombat";

export type DndMonsterActionKind = "action" | "bonusAction" | "reaction" | "legendaryAction";

export type DndMonsterLiveAction = {
  id: string;
  kind: DndMonsterActionKind;
  name: string;
  summary: string;
  reachOrRange?: string;
  rechargeLabel?: string;
  rechargeMinimum?: number;
  rechargeReady: boolean;
};

export type DndMonsterLiveReference = {
  monsterId: string;
  sourceReference: string;
  size: DndCreatureSize;
  armorClass: string;
  savingThrows: string;
  senses: string;
  actions: DndMonsterLiveAction[];
};

const slug = (value: string) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "") || "action";

export const parseDndRechargeMinimum = (value?: string): number | undefined => {
  if (!value) return undefined;
  const match = value.match(/Recharge\s+(\d)(?:\s*[–—-]\s*(\d))?/i);
  if (!match) return undefined;
  const minimum = Number(match[1]);
  return Number.isFinite(minimum) && minimum >= 1 && minimum <= 6 ? minimum : undefined;
};

const toLiveAction = (
  action: MonsterCombatActionReference,
  kind: DndMonsterActionKind,
  index: number
): DndMonsterLiveAction => {
  const rechargeMinimum = parseDndRechargeMinimum(action.recharge);
  return {
    id: `${kind}-${index}-${slug(action.name)}`,
    kind,
    name: action.name,
    summary: action.summary,
    reachOrRange: action.reachOrRange,
    rechargeLabel: action.recharge,
    rechargeMinimum,
    rechargeReady: true
  };
};

const formattedSummary = (item: MonsterItem): string => [
  item.hit,
  item.reach,
  item.damage,
  item.text
].filter(Boolean).join(" · ") || "Open the sourced monster folio for the full procedure.";

const formattedAction = (
  item: MonsterItem,
  kind: DndMonsterActionKind,
  index: number
): DndMonsterLiveAction => {
  const rechargeLabel = item.name.match(/Recharge\s+[^)]+/i)?.[0];
  const rechargeMinimum = parseDndRechargeMinimum(rechargeLabel);
  return {
    id: `${kind}-${index}-${slug(item.name)}`,
    kind,
    name: item.name,
    summary: formattedSummary(item),
    reachOrRange: item.reach,
    rechargeLabel,
    rechargeMinimum,
    rechargeReady: true
  };
};

export const buildDndMonsterLiveReference = (
  entry: EncounterMonsterEntry
): DndMonsterLiveReference => {
  if (entry.kind === "formatted") {
    const monster = entry.monster;
    return {
      monsterId: entry.id,
      sourceReference: entry.source,
      size: parseDndCreatureSize(monster.size),
      armorClass: monster.ac,
      savingThrows: monster.saves.join(", "),
      senses: monster.senses,
      actions: [
        ...monster.actions.map((item, index) => formattedAction(item, "action", index)),
        ...monster.bonusActions.map((item, index) => formattedAction(item, "bonusAction", index)),
        ...monster.reactions.map((item, index) => formattedAction(item, "reaction", index)),
        ...monster.legendaryActions.map((item, index) => formattedAction(item, "legendaryAction", index))
      ]
    };
  }

  const monster = entry.monster;
  const reference = buildMonsterCombatReference(monster);
  return {
    monsterId: entry.id,
    sourceReference: entry.source,
    size: parseDndCreatureSize(monster.size),
    armorClass: monster.armorClass,
    savingThrows: reference.savingThrows,
    senses: reference.senses,
    actions: [
      ...reference.allActions.map((action, index) => toLiveAction(action, "action", index)),
      ...reference.bonusActions.map((action, index) => toLiveAction(action, "bonusAction", index)),
      ...reference.reactions.map((action, index) => toLiveAction(action, "reaction", index)),
      ...reference.legendaryActions.map((action, index) => toLiveAction(action, "legendaryAction", index))
    ]
  };
};

export const spendDndMonsterLiveAction = (
  reference: DndMonsterLiveReference,
  actionId: string
): DndMonsterLiveReference => ({
  ...reference,
  actions: reference.actions.map((action) => action.id === actionId && action.rechargeMinimum !== undefined
    ? { ...action, rechargeReady: false }
    : action)
});

export const resolveDndMonsterRecharge = (
  reference: DndMonsterLiveReference,
  actionId: string,
  roll: number
): { reference: DndMonsterLiveReference; succeeded: boolean; minimum?: number } => {
  const normalizedRoll = Math.min(6, Math.max(1, Math.trunc(Number.isFinite(roll) ? roll : 1)));
  const action = reference.actions.find((candidate) => candidate.id === actionId);
  const minimum = action?.rechargeMinimum;
  if (!action || minimum === undefined) return { reference, succeeded: false, minimum };
  const succeeded = normalizedRoll >= minimum;
  return {
    reference: {
      ...reference,
      actions: reference.actions.map((candidate) => candidate.id === actionId
        ? { ...candidate, rechargeReady: succeeded }
        : candidate)
    },
    succeeded,
    minimum
  };
};