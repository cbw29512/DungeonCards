import type { RollResult } from "../types/cards";

export type AttackRollImpactKind = "critical-hit" | "automatic-miss";

export type AttackRollImpact = {
  kind: AttackRollImpactKind;
  title: string;
  subtitle: string;
};

export const getAttackRollImpact = (
  result?: Pick<RollResult, "isCritical" | "isFailure">
): AttackRollImpact | null => {
  try {
    if (result?.isCritical) {
      return {
        kind: "critical-hit",
        title: "Natural 20!",
        subtitle: "Critical Hit"
      };
    }

    if (result?.isFailure) {
      return {
        kind: "automatic-miss",
        title: "Natural 1!",
        subtitle: "Automatic Miss"
      };
    }

    return null;
  } catch (error) {
    console.error("Resolving attack roll impact failed", { result, error });
    return null;
  }
};
