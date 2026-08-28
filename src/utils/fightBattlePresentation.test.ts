import { describe, expect, it } from "vitest";
import type { FightBattleState } from "../types/fightBattle";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import {
  characterPixelIdentity,
  deriveFightPixelFrame,
  monsterPixelIdentity,
  monsterVisualArchetype
} from "./fightBattlePresentation";

const profile = (id: string, name: string): FightCombatantProfile => ({
  id,
  name,
  ruleset: "srd-5.1-2014",
  armorClass: 15,
  hitPoints: 20,
  attackBonus: 5,
  attacksPerRound: 1,
  averageDamageOnHit: 7.5,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword",
  initiativeBonus: 2
});

const combatantState = (combatantProfile: FightCombatantProfile, currentHitPoints: number) => ({
  profile: combatantProfile,
  currentHitPoints,
  effects: [],
  resources: {},
  rechargeReady: {},
  economy: {
    actionsAvailable: 1,
    bonusActionsAvailable: 1,
    reactionAvailable: true,
    movementRemainingFeet: 30
  }
});

const activeState = (): FightBattleState => ({
  status: "active",
  round: 2,
  activeIndex: 0,
  distanceFeet: 5,
  initiative: {
    characterNaturalRoll: 14,
    characterTotal: 16,
    monsterNaturalRoll: 10,
    monsterTotal: 11,
    order: ["character", "monster"]
  },
  character: combatantState(profile("hero", "Hero"), 20),
  monster: combatantState(profile("monster", "Monster"), 12),
  events: []
});

describe("fight battle pixel presentation", () => {
  it("derives stable character and monster sprite identities", () => {
    expect(characterPixelIdentity("Battle Master").spriteKey).toBe("hero-battle-master");
    expect(monsterPixelIdentity("Young Red Dragon", "dragon")).toMatchObject({
      archetype: "dragon",
      spriteKey: "dragon-young-red-dragon"
    });
    expect(monsterVisualArchetype("Large undead")).toBe("undead");
    expect(monsterVisualArchetype("humanoid (goblinoid)")).toBe("humanoid");
  });

  it("renders misses as attack-side miss cues without damage feedback", () => {
    const state = activeState();
    state.events.push({
      id: 1,
      round: 2,
      attacker: "character",
      target: "monster",
      attackNumber: 1,
      sourceActionName: "Longsword",
      naturalRoll: 4,
      attackTotal: 9,
      outcome: "miss",
      damage: 0,
      targetHitPointsAfter: 12,
      summary: "Hero Longsword: miss."
    });
    expect(deriveFightPixelFrame(state)).toMatchObject({
      characterCue: "miss",
      monsterCue: "idle",
      headline: "MISS!",
      damageNumber: undefined
    });
  });

  it("renders critical hits and damage on the exact target", () => {
    const state = activeState();
    state.events.push({
      id: 1,
      round: 2,
      attacker: "monster",
      target: "character",
      attackNumber: 1,
      sourceActionName: "Claw",
      naturalRoll: 20,
      attackTotal: 25,
      outcome: "critical",
      damage: 14,
      targetHitPointsAfter: 6,
      summary: "Monster Claw: critical for 14 damage."
    });
    expect(deriveFightPixelFrame(state)).toMatchObject({
      characterCue: "hurt",
      monsterCue: "critical",
      headline: "CRITICAL HIT!",
      damageNumber: 14,
      damageTarget: "character"
    });
  });

  it("renders winner and KO only after the rules engine completes combat", () => {
    const state = activeState();
    state.status = "complete";
    state.winner = "monster";
    state.character.currentHitPoints = 0;
    const frame = deriveFightPixelFrame(state);
    expect(frame.monsterCue).toBe("victory");
    expect(frame.characterCue).toBe("ko");
    expect(frame.headline).toBe("Monster WINS!");
  });
});
