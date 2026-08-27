import type {
  CardDefinition,
  CardReview,
  CardVisibility,
  DndGameSystemId
} from "../types/cardPlatform";
import type { CardActionDefinition } from "../types/cardPlatformActions";
import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { MonsterCardData, MonsterItem } from "../types/monsters";
import { gameSystemIdForRuleset } from "./cardPlatformGameSystem";
import { reconcileMonsterActions, type MonsterActionLike } from "./monsterActionCanonicalization";

export type MonsterAdapterOptions = {
  homebrewGameSystemId?: DndGameSystemId;
  review?: CardReview;
  visibility?: CardVisibility;
};

const safePart = (value: string): string => value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "entry";
const damageFormula = (value?: string): string | undefined => value?.match(/\d+d\d+(?:\s*[+-]\s*\d+)?/i)?.[0].replaceAll(" ", "");
const leadingNumber = (value: string): number | undefined => {
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
};

const itemAction = (item: MonsterItem, prefix: string, index: number): CardActionDefinition => {
  const formula = damageFormula(item.damage);
  const notes = [item.hit, item.reach, item.text].filter(Boolean).join(" · ") || undefined;
  return formula ? {
    id: `${prefix}-${index}-${safePart(item.name)}`,
    kind: "roll",
    label: item.name,
    rollSystem: "dice-formula",
    formula,
    notes
  } : {
    id: `${prefix}-${index}-${safePart(item.name)}`,
    kind: "procedure",
    label: item.name,
    steps: [item.hit, item.reach, item.damage, item.text].filter((step): step is string => Boolean(step))
  };
};

type FormattedActionCandidate = MonsterActionLike & {
  item: MonsterItem;
  prefix: string;
  index: number;
  priority: number;
};

const formattedCandidate = (
  item: MonsterItem,
  prefix: string,
  index: number,
  priority: number
): FormattedActionCandidate => ({
  item,
  prefix,
  index,
  priority,
  name: item.name,
  summary: [item.hit, item.reach, item.damage, item.text].filter(Boolean).join(" · "),
  reachOrRange: item.reach
});

const formattedActions = (monster: MonsterCardData): CardActionDefinition[] => reconcileMonsterActions([
  ...monster.actions.map((item, index) => formattedCandidate(item, "action", index, 0)),
  ...monster.legendaryActions.map((item, index) => formattedCandidate(item, "legendary", index, 1)),
  ...monster.bonusActions.map((item, index) => formattedCandidate(item, "bonus", index, 2)),
  ...monster.reactions.map((item, index) => formattedCandidate(item, "reaction", index, 3))
], (candidate, existing) => candidate.priority > existing.priority)
  .map((candidate) => itemAction(candidate.item, candidate.prefix, candidate.index))
  .filter((action) => action.kind !== "procedure" || action.steps.length > 0);

const referenceActions = (entry: EncounterMonsterEntry): CardActionDefinition[] => {
  if (entry.kind !== "reference") return [];
  const sections = [
    ["actions", "Actions", entry.monster.actions],
    ["bonus-actions", "Bonus Actions", entry.monster.bonusActions],
    ["reactions", "Reactions", entry.monster.reactions],
    ["legendary-actions", "Legendary Actions", entry.monster.legendaryActions]
  ] as const;
  return sections.filter(([, , text]) => text.trim()).map(([id, label, text]) => ({
    id,
    kind: "procedure" as const,
    label,
    steps: [text]
  }));
};

export const adaptEncounterMonster = (
  entry: EncounterMonsterEntry,
  options: MonsterAdapterOptions = {}
): CardDefinition => {
  const gameSystemId = entry.ruleset === "homebrew"
    ? options.homebrewGameSystemId
    : gameSystemIdForRuleset(entry.ruleset);
  if (!gameSystemId) throw new Error("Homebrew monster adapters require an exact D&D edition.");
  const homebrew = entry.ruleset === "homebrew";
  const hpText = entry.kind === "formatted" ? entry.monster.hp : entry.monster.hitPoints;
  const hp = leadingNumber(hpText);
  const detail = entry.kind === "formatted"
    ? `AC ${entry.monster.ac}; HP ${entry.monster.hp}; Speed ${entry.monster.speed}.`
    : `AC ${entry.monster.armorClass}; HP ${entry.monster.hitPoints}; Speed ${entry.monster.speed}. ${entry.monster.traits}`.trim();
  return {
    schemaVersion: 2,
    id: `legacy-monster:${gameSystemId}:${safePart(entry.id)}`,
    gameSystemId,
    family: "creature",
    visibility: options.visibility ?? (homebrew ? "private" : "game-master-only"),
    content: {
      title: entry.name,
      subtitle: `${entry.size} ${entry.type} · CR ${entry.cr}`,
      summary: `${entry.size} ${entry.type} encounter reference for D&D ${gameSystemId === "dnd-2014" ? "2014" : "2024"}.`,
      detail,
      tags: [...new Set(["legacy-monster", entry.kind, safePart(entry.type), `cr-${safePart(entry.cr)}`])]
    },
    source: homebrew ? {
      kind: "user-owned-private",
      title: entry.source || "Private homebrew monster",
      edition: gameSystemId,
      publicDistributionAllowed: false
    } : {
      kind: "srd",
      title: entry.source,
      edition: entry.ruleset,
      license: "CC BY 4.0",
      publicDistributionAllowed: true
    },
    review: options.review ?? { status: homebrew ? "draft" : "rules-reviewed" },
    actions: entry.kind === "formatted" ? formattedActions(entry.monster) : referenceActions(entry),
    resources: hp === undefined ? [] : [{ id: "hit-points", label: "Hit Points", maximum: hp, initial: hp, refresh: "manual", unit: "HP" }],
    linkedCardIds: [],
    print: { format: "standard-card", sizeId: "poker-2.5x3.5", faces: "front-back" }
  };
};
