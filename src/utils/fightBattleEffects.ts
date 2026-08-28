import type {
  FightBattleState,
  FightEffectState,
  FightEffectTickTiming,
  FightSide
} from "../types/fightBattle";
import type { RandomIntegerSource } from "./randomInteger";
import {
  appendFightPresentationEvent,
  appendFightPresentationEvents,
  effectDelivery
} from "./fightPresentationEvents";
import { resolveFightSavingThrow } from "./fightSavingThrow";

const normalizeEffect = (effect: FightEffectState): FightEffectState => ({
  ...effect,
  id: effect.id.trim(),
  name: effect.name.trim(),
  remainingRounds: effect.remainingRounds === undefined ? undefined : Math.max(1, Math.trunc(effect.remainingRounds)),
  saveDc: effect.saveDc === undefined ? undefined : Math.max(1, Math.trunc(effect.saveDc))
});

const normalizeCondition = (value: string): string => value.trim().toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
const concentrationOwnerId = (state: FightBattleState, side: FightSide): string | undefined => state[side].combatantId;

const effectRemovedEvent = (side: FightSide, effect: FightEffectState) => ({
  type: "effect-removed" as const,
  delivery: effectDelivery(effect.kind),
  side,
  sourceSide: effect.concentrationOwner,
  label: `${effect.name} ended`,
  iconKey: effect.iconKey,
  sourceName: effect.sourceName
});

export const applyFightEffect = (
  state: FightBattleState,
  side: FightSide,
  effect: FightEffectState
): FightBattleState => {
  const normalized = normalizeEffect(effect);
  if (!normalized.id || !normalized.name) return state;
  if (normalized.kind === "condition") {
    const immunities = new Set((state[side].profile.conditionImmunities ?? []).map(normalizeCondition));
    const condition = normalizeCondition(normalized.iconKey ?? normalized.id ?? normalized.name);
    if (immunities.has(condition) || immunities.has(normalizeCondition(normalized.name))) {
      return appendFightPresentationEvent(state, {
        type: "effect-immune",
        delivery: "condition",
        side,
        sourceSide: normalized.concentrationOwner,
        label: `Immune to ${normalized.name}`,
        iconKey: normalized.iconKey,
        sourceName: normalized.sourceName
      });
    }
  }
  const effects = state[side].effects.filter((candidate) => candidate.id !== normalized.id);
  const next = {
    ...state,
    [side]: { ...state[side], effects: [...effects, normalized] }
  };
  return appendFightPresentationEvent(next, {
    type: "effect-applied",
    delivery: effectDelivery(normalized.kind),
    side,
    sourceSide: normalized.concentrationOwner,
    label: `${normalized.name} applied`,
    iconKey: normalized.iconKey,
    sourceName: normalized.sourceName,
    saveAbility: normalized.saveAbility,
    saveDc: normalized.saveDc
  });
};

export const removeFightEffect = (
  state: FightBattleState,
  side: FightSide,
  effectId: string
): FightBattleState => {
  const effect = state[side].effects.find((candidate) => candidate.id === effectId);
  if (!effect) return state;
  const next = {
    ...state,
    [side]: { ...state[side], effects: state[side].effects.filter((candidate) => candidate.id !== effectId) }
  };
  return appendFightPresentationEvent(next, effectRemovedEvent(side, effect));
};

export const tickFightEffects = (
  state: FightBattleState,
  side: FightSide,
  timing: Exclude<FightEffectTickTiming, "manual">
): FightBattleState => {
  const expired: FightEffectState[] = [];
  const effects = state[side].effects
    .map((effect) => {
      if (effect.tickTiming !== timing || effect.remainingRounds === undefined) return effect;
      const remainingRounds = Math.max(0, effect.remainingRounds - 1);
      const next = { ...effect, remainingRounds };
      if (remainingRounds === 0) expired.push(next);
      return next;
    })
    .filter((effect) => effect.remainingRounds === undefined || effect.remainingRounds > 0);
  const next = { ...state, [side]: { ...state[side], effects } };
  return appendFightPresentationEvents(next, expired.map((effect) => effectRemovedEvent(side, effect)));
};

export const resolveFightEffectSave = ({
  state,
  side,
  effectId,
  naturalRoll,
  saveBonus
}: {
  state: FightBattleState;
  side: FightSide;
  effectId: string;
  naturalRoll: number;
  saveBonus: number;
}): { state: FightBattleState; total: number; succeeded: boolean } => {
  const effect = state[side].effects.find((candidate) => candidate.id === effectId);
  const roll = Math.min(20, Math.max(1, Math.trunc(naturalRoll)));
  const total = roll + Math.trunc(saveBonus);
  if (!effect?.saveDc) return { state, total, succeeded: false };
  const succeeded = total >= effect.saveDc;
  let next = appendFightPresentationEvent(state, {
    type: succeeded ? "save-success" : "save-failure",
    delivery: effectDelivery(effect.kind),
    side,
    sourceSide: effect.concentrationOwner,
    label: `${effect.name}: save ${succeeded ? "succeeds" : "fails"}`,
    iconKey: effect.iconKey,
    sourceName: effect.sourceName,
    saveAbility: effect.saveAbility,
    saveDc: effect.saveDc,
    saveTotal: total
  });
  if (succeeded) next = removeFightEffect(next, side, effectId);
  return { state: next, total, succeeded };
};

export const resolveFightTimedEffectSaves = (
  state: FightBattleState,
  side: FightSide,
  timing: Exclude<FightEffectTickTiming, "manual">,
  randomInteger?: RandomIntegerSource
): FightBattleState => {
  let next = state;
  const effectIds = next[side].effects
    .filter((effect) => effect.saveTiming === timing && effect.saveAbility && effect.saveDc)
    .map((effect) => effect.id);
  for (const effectId of effectIds) {
    const effect = next[side].effects.find((candidate) => candidate.id === effectId);
    if (!effect?.saveAbility || !effect.saveDc) continue;
    const result = resolveFightSavingThrow({
      state: next,
      side,
      ability: effect.saveAbility,
      dc: effect.saveDc,
      randomInteger
    });
    next = appendFightPresentationEvent(result.state, {
      type: result.succeeded ? "save-success" : "save-failure",
      delivery: effectDelivery(effect.kind),
      side,
      sourceSide: effect.concentrationOwner,
      label: `${effect.name}: save ${result.succeeded ? "succeeds" : "fails"}`,
      iconKey: effect.iconKey,
      sourceName: effect.sourceName,
      saveAbility: effect.saveAbility,
      saveDc: effect.saveDc,
      saveTotal: result.total
    });
    if (result.succeeded) next = removeFightEffect(next, side, effectId);
  }
  return next;
};

export const startFightConcentration = (
  state: FightBattleState,
  side: FightSide,
  sourceName: string
): FightBattleState => {
  const cleanName = sourceName.trim();
  if (!cleanName) return state;
  const cleared = state[side].concentration ? breakFightConcentration(state, side) : state;
  const next = {
    ...cleared,
    [side]: {
      ...cleared[side],
      concentration: { sourceName: cleanName, ownerCombatantId: concentrationOwnerId(cleared, side) }
    }
  };
  return appendFightPresentationEvent(next, {
    type: "concentration-started",
    delivery: "spell",
    side,
    sourceSide: side,
    label: `Concentrating on ${cleanName}`,
    iconKey: "concentration",
    sourceName: cleanName
  });
};

export const breakFightConcentration = (
  state: FightBattleState,
  owner: FightSide
): FightBattleState => {
  const concentration = state[owner].concentration;
  const ownerId = concentration?.ownerCombatantId ?? concentrationOwnerId(state, owner);
  const removed: Array<{ side: FightSide; effect: FightEffectState }> = [];
  const strip = (side: FightSide) => state[side].effects.filter((effect) => {
    const matchesId = ownerId && effect.concentrationOwnerId === ownerId;
    const legacyMatch = !effect.concentrationOwnerId && effect.concentrationOwner === owner;
    if (!matchesId && !legacyMatch) return true;
    removed.push({ side, effect });
    return false;
  });
  const hasLinked = state.character.effects.some((effect) => (
    ownerId ? effect.concentrationOwnerId === ownerId : effect.concentrationOwner === owner
  )) || state.monster.effects.some((effect) => (
    ownerId ? effect.concentrationOwnerId === ownerId : effect.concentrationOwner === owner
  ));
  if (!concentration && !hasLinked) return state;
  const characterEffects = strip("character");
  const monsterEffects = strip("monster");
  let next: FightBattleState = {
    ...state,
    character: {
      ...state.character,
      effects: characterEffects,
      concentration: owner === "character" ? undefined : state.character.concentration
    },
    monster: {
      ...state.monster,
      effects: monsterEffects,
      concentration: owner === "monster" ? undefined : state.monster.concentration
    }
  };
  next = appendFightPresentationEvents(next, removed.map(({ side, effect }) => effectRemovedEvent(side, effect)));
  return appendFightPresentationEvent(next, {
    type: "concentration-broken",
    delivery: "spell",
    side: owner,
    sourceSide: owner,
    label: concentration ? `${concentration.sourceName} concentration broken` : "Concentration broken",
    iconKey: "concentration",
    sourceName: concentration?.sourceName
  });
};

export const healFightCombatant = (
  state: FightBattleState,
  side: FightSide,
  amount: number,
  sourceName = "Healing"
): FightBattleState => {
  const requested = Math.max(0, Math.trunc(amount));
  const current = state[side].currentHitPoints;
  const maximum = state[side].profile.hitPoints;
  const healed = Math.min(requested, Math.max(0, maximum - current));
  if (healed === 0) return state;
  const next = { ...state, [side]: { ...state[side], currentHitPoints: current + healed } };
  return appendFightPresentationEvent(next, {
    type: "healing",
    delivery: "spell",
    side,
    label: `+${healed} HP`,
    sourceName,
    amount: healed,
    iconKey: "healing"
  });
};

export const grantFightTemporaryHitPoints = (
  state: FightBattleState,
  side: FightSide,
  amount: number,
  sourceName = "Temporary HP"
): FightBattleState => {
  const granted = Math.max(0, Math.trunc(amount));
  const current = state[side].temporaryHitPoints ?? 0;
  if (granted <= current) return state;
  const next = { ...state, [side]: { ...state[side], temporaryHitPoints: granted } };
  return appendFightPresentationEvent(next, {
    type: "temporary-hit-points",
    delivery: "buff",
    side,
    label: `+${granted} temporary HP`,
    sourceName,
    amount: granted,
    iconKey: "temporary-hit-points"
  });
};
