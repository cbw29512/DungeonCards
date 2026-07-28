import type {
  DndCharacterResource
} from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";

export const dndRogueLevels = Array.from({ length: 20 }, (_, index) => index + 1);

export const attainedRogueFeatures = (
  level: number,
  entries: Array<[number, string]>
): string[] => entries
  .filter(([unlock]) => level >= unlock)
  .map(([, feature]) => feature);

export const rogueSneakAttackDice = (level: number): number => Math.ceil(level / 2);
export const rogueSneakAttackFormula = (level: number): string =>
  `${rogueSneakAttackDice(level)}d6`;

export const rogueResources = (
  ruleset: RulesetId,
  level: number
): DndCharacterResource[] => [
  {
    id: "sneak-attack",
    name: "Sneak Attack",
    maximum: 1,
    refresh: "turn",
    notes: `Once per turn; ${rogueSneakAttackFormula(level)} extra damage when the trigger is met.`
  },
  ...(ruleset === "srd-5.2.1-2024"
    ? [{
        id: "heroic-inspiration",
        name: "Human Resourceful — Heroic Inspiration",
        maximum: 1,
        refresh: "long-rest" as const,
        notes: "Gain Heroic Inspiration whenever you finish a Long Rest."
      }]
    : []),
  ...(level >= 20
    ? [{
        id: "stroke-of-luck",
        name: "Stroke of Luck",
        maximum: 1,
        refresh: "short-rest" as const
      }]
    : [])
];

export const rogueAttackNotes = (
  level: number,
  extra = ""
): string => `Sneak Attack ${rogueSneakAttackFormula(level)} once per turn when eligible.${extra}`.trim();
