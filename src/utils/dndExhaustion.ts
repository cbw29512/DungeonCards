import type { DndExhaustionState } from "../types/dndConditions";
import type { RulesetId } from "../types/ruleCards";

const clampLevel = (level: number): number => Math.min(6, Math.max(0, Math.trunc(level) || 0));

const effects2014 = [
  "Disadvantage on ability checks.",
  "Speed is halved.",
  "Disadvantage on attack rolls and saving throws.",
  "Hit point maximum is halved.",
  "Speed becomes 0.",
  "Death."
];

export const describeDndExhaustion = (
  edition: RulesetId,
  requestedLevel: number
): DndExhaustionState => {
  const level = clampLevel(requestedLevel);
  if (edition === "srd-5.1-2014") {
    return {
      edition,
      level,
      isDead: level >= 6,
      d20Penalty: 0,
      speedPenaltyFeet: 0,
      effects: effects2014.slice(0, level)
    };
  }

  return {
    edition,
    level,
    isDead: level >= 6,
    d20Penalty: level * 2,
    speedPenaltyFeet: level * 5,
    effects: level === 0
      ? []
      : [
          `Subtract ${level * 2} from every d20 Test.`,
          `Reduce Speed by ${level * 5} feet.`,
          ...(level >= 6 ? ["Death."] : [])
        ]
  };
};
