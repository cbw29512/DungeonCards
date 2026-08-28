import { describe, expect, it } from "vitest";
import type { FightBattleCombatantState, FightBattleState } from "../types/fightBattle";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import {
  consumeFightAttackFollowUps,
  expireFightAttackFollowUps,
  fightAttackFollowUpRollMode,
  recordFightAttackFollowUps
} from "./fightAttackFollowUps";
import { createFightBattle } from "./fightBattle";

const profile = (id: string): FightCombatantProfile => ({
  id,
  name: id,
  ruleset: "srd-5.2.1-2024",
  armorClass: 15,
  hitPoints: 30,
  attackBonus: 5,
  attacksPerRound: 1,
  averageDamageOnHit: 7,
  initiativeBonus: 0,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Attack",
  attackDelivery: "weapon",
  attackFollowUps: [{
    id: "studied-attacks",
    name: "Studied Attacks",
    trigger: "miss",
    rollMode: "advantage",
    target: "same-creature",
    expires: "end-of-next-turn"
  }]
});

const replacement = (id: string): FightBattleCombatantState => ({
  combatantId: id,
  positionFeet: 30,
  turnsStarted: 0,
  profile: profile(id),
  currentHitPoints: 30,
  temporaryHitPoints: 0,
  effects: [],
  attackFollowUps: [],
  resources: {},
  rechargeReady: {},
  economy: { actionsAvailable: 1, bonusActionsAvailable: 1, reactionAvailable: true, movementRemainingFeet: 30 }
});

describe("target-specific attack follow-ups", () => {
  it("grants a miss follow-up only for the creature that was missed", () => {
    let state = createFightBattle(profile("fighter"), profile("monster-a"));
    state = {
      ...state,
      character: { ...state.character, turnsStarted: 1 }
    };
    state = recordFightAttackFollowUps({ state, attacker: "character", target: "monster", outcome: "miss", damage: 0 });

    expect(fightAttackFollowUpRollMode(state.character, state.monster)).toBe("advantage");
    const other = replacement("monster-b");
    expect(fightAttackFollowUpRollMode(state.character, other)).toBeUndefined();
    expect(state.character.attackFollowUps).toEqual([
      expect.objectContaining({ targetCombatantId: "monster-a", expiresAfterOwnerTurn: 2 })
    ]);
  });

  it("attacking another creature does not consume the original target's benefit", () => {
    let state = createFightBattle(profile("fighter"), profile("monster-a"));
    state = {
      ...state,
      character: { ...state.character, turnsStarted: 1 }
    };
    state = recordFightAttackFollowUps({ state, attacker: "character", target: "monster", outcome: "miss", damage: 0 });
    const original = state.character.attackFollowUps;
    const againstOther: FightBattleState = { ...state, monster: replacement("monster-b") };
    const afterOther = consumeFightAttackFollowUps(againstOther, "character", "monster");
    expect(afterOther.character.attackFollowUps).toEqual(original);
  });

  it("consumes the benefit on the next attack roll against the matching creature", () => {
    let state = createFightBattle(profile("fighter"), profile("monster-a"));
    state = {
      ...state,
      character: { ...state.character, turnsStarted: 1 }
    };
    state = recordFightAttackFollowUps({ state, attacker: "character", target: "monster", outcome: "miss", damage: 0 });
    state = consumeFightAttackFollowUps(state, "character", "monster");
    expect(state.character.attackFollowUps).toEqual([]);
    expect(state.presentationEvents?.at(-1)?.type).toBe("attack-follow-up-consumed");
  });

  it("expires at the end of the owner's next turn and not earlier", () => {
    let state = createFightBattle(profile("fighter"), profile("monster-a"));
    state = {
      ...state,
      character: { ...state.character, turnsStarted: 1 }
    };
    state = recordFightAttackFollowUps({ state, attacker: "character", target: "monster", outcome: "miss", damage: 0 });
    state = expireFightAttackFollowUps(state, "character");
    expect(state.character.attackFollowUps).toHaveLength(1);

    state = { ...state, character: { ...state.character, turnsStarted: 2 } };
    state = expireFightAttackFollowUps(state, "character");
    expect(state.character.attackFollowUps).toEqual([]);
    expect(state.presentationEvents?.at(-1)?.type).toBe("attack-follow-up-expired");
  });

  it("a new miss refreshes the same follow-up for that target", () => {
    let state = createFightBattle(profile("fighter"), profile("monster-a"));
    state = { ...state, character: { ...state.character, turnsStarted: 1 } };
    state = recordFightAttackFollowUps({ state, attacker: "character", target: "monster", outcome: "miss", damage: 0 });
    state = consumeFightAttackFollowUps(state, "character", "monster");
    state = { ...state, character: { ...state.character, turnsStarted: 2 } };
    state = recordFightAttackFollowUps({ state, attacker: "character", target: "monster", outcome: "miss", damage: 0 });
    expect(state.character.attackFollowUps).toEqual([
      expect.objectContaining({ targetCombatantId: "monster-a", expiresAfterOwnerTurn: 3 })
    ]);
  });
});
