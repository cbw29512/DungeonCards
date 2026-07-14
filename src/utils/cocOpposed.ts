import type { CocPercentileResult, CocSuccessLevel } from "../types/coc";

export type CocOpposedSide = {
  label: string;
  skillValue: number;
  result: CocPercentileResult;
};

export type CocGenericOpposedOutcome =
  | "side-a-wins"
  | "side-b-wins"
  | "no-winner"
  | "tie-break-required"
  | "tie-break-tied";

export type CocGenericOpposedResolution = {
  outcome: CocGenericOpposedOutcome;
  winner?: "side-a" | "side-b";
  reason: string;
};

export type CocCloseCombatResponse = "dodge" | "fight-back";

export type CocCloseCombatOutcome =
  | "attacker-hits"
  | "defender-dodges"
  | "defender-fights-back"
  | "no-damage";

export type CocCloseCombatResolution = {
  outcome: CocCloseCombatOutcome;
  reason: string;
};

const successRank: Record<CocSuccessLevel, number> = {
  fumble: 0,
  failure: 0,
  regular: 1,
  hard: 2,
  extreme: 3,
  critical: 4
};

const isSuccessful = (level: CocSuccessLevel): boolean => successRank[level] > 0;

export const resolveCocGenericOpposed = (
  sideA: CocOpposedSide,
  sideB: CocOpposedSide,
  tieBreak?: { sideARoll: number; sideBRoll: number }
): CocGenericOpposedResolution => {
  const sideASuccess = isSuccessful(sideA.result.successLevel);
  const sideBSuccess = isSuccessful(sideB.result.successLevel);

  if (!sideASuccess && !sideBSuccess) {
    return {
      outcome: "no-winner",
      reason: "Both sides failed, so neither side wins the opposed roll."
    };
  }

  const rankDifference = successRank[sideA.result.successLevel] - successRank[sideB.result.successLevel];
  if (rankDifference > 0) {
    return {
      outcome: "side-a-wins",
      winner: "side-a",
      reason: `${sideA.label} achieved the higher level of success.`
    };
  }
  if (rankDifference < 0) {
    return {
      outcome: "side-b-wins",
      winner: "side-b",
      reason: `${sideB.label} achieved the higher level of success.`
    };
  }

  if (sideA.skillValue > sideB.skillValue) {
    return {
      outcome: "side-a-wins",
      winner: "side-a",
      reason: `The success levels match, so ${sideA.label} wins with the higher skill value.`
    };
  }
  if (sideB.skillValue > sideA.skillValue) {
    return {
      outcome: "side-b-wins",
      winner: "side-b",
      reason: `The success levels match, so ${sideB.label} wins with the higher skill value.`
    };
  }

  if (!tieBreak) {
    return {
      outcome: "tie-break-required",
      reason: "The success levels and skill values match. Roll a separate D100 for each side; the lower result wins."
    };
  }

  if (tieBreak.sideARoll < tieBreak.sideBRoll) {
    return {
      outcome: "side-a-wins",
      winner: "side-a",
      reason: `${sideA.label} wins the equal-skill tie-break with the lower D100 result.`
    };
  }
  if (tieBreak.sideBRoll < tieBreak.sideARoll) {
    return {
      outcome: "side-b-wins",
      winner: "side-b",
      reason: `${sideB.label} wins the equal-skill tie-break with the lower D100 result.`
    };
  }

  return {
    outcome: "tie-break-tied",
    reason: "The tie-break rolls are equal. Roll the tie-break again."
  };
};

export const resolveCocCloseCombat = (
  attacker: CocPercentileResult,
  defender: CocPercentileResult,
  response: CocCloseCombatResponse
): CocCloseCombatResolution => {
  const attackerSucceeded = isSuccessful(attacker.successLevel);
  const defenderSucceeded = isSuccessful(defender.successLevel);

  if (!attackerSucceeded && !defenderSucceeded) {
    return {
      outcome: "no-damage",
      reason: "Both combat rolls failed, so neither side inflicts damage."
    };
  }

  if (response === "dodge") {
    if (!attackerSucceeded) {
      return {
        outcome: "defender-dodges",
        reason: "The attack failed, so the defender avoids the attack."
      };
    }
    if (!defenderSucceeded) {
      return {
        outcome: "attacker-hits",
        reason: "The attack succeeded and the Dodge roll failed."
      };
    }

    if (successRank[attacker.successLevel] > successRank[defender.successLevel]) {
      return {
        outcome: "attacker-hits",
        reason: "The attacker achieved a higher level of success than the Dodge roll."
      };
    }

    return {
      outcome: "defender-dodges",
      reason: "Dodge wins when its success level equals or exceeds the attacker's level."
    };
  }

  if (!attackerSucceeded) {
    if (defenderSucceeded) {
      return {
        outcome: "defender-fights-back",
        reason: "The attack failed and the defender succeeded while Fighting Back."
      };
    }
    return {
      outcome: "no-damage",
      reason: "Neither side achieved a successful combat roll."
    };
  }

  if (!defenderSucceeded) {
    return {
      outcome: "attacker-hits",
      reason: "The attack succeeded and the Fight Back roll failed."
    };
  }

  if (successRank[defender.successLevel] > successRank[attacker.successLevel]) {
    return {
      outcome: "defender-fights-back",
      reason: "The defender achieved a higher level of success and successfully Fights Back."
    };
  }

  return {
    outcome: "attacker-hits",
    reason: "The initiating attacker wins equal success levels against Fight Back."
  };
};