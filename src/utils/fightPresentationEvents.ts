import type {
  FightBattleState,
  FightEffectKind,
  FightPresentationDelivery,
  FightPresentationEvent,
  FightPresentationEventType,
  FightSide
} from "../types/fightBattle";

export type FightPresentationEventInput = Omit<FightPresentationEvent, "id" | "round"> & { round?: number };

export const effectDelivery = (kind: FightEffectKind): FightPresentationDelivery => kind;

export const appendFightPresentationEvent = (
  state: FightBattleState,
  input: FightPresentationEventInput
): FightBattleState => {
  const events = state.presentationEvents ?? [];
  const event: FightPresentationEvent = {
    ...input,
    id: (events.at(-1)?.id ?? 0) + 1,
    round: input.round ?? state.round
  };
  return { ...state, presentationEvents: [...events, event] };
};

export const appendFightPresentationEvents = (
  state: FightBattleState,
  inputs: FightPresentationEventInput[]
): FightBattleState => inputs.reduce(appendFightPresentationEvent, state);

export const recordFightAttackPresentation = ({
  state,
  attacker,
  target,
  sourceName,
  outcome,
  damage,
  delivery = "weapon"
}: {
  state: FightBattleState;
  attacker: FightSide;
  target: FightSide;
  sourceName: string;
  outcome: "miss" | "hit" | "critical";
  damage: number;
  delivery?: Extract<FightPresentationDelivery, "weapon" | "spell">;
}): FightBattleState => {
  const type: FightPresentationEventType = outcome === "critical" ? "critical" : outcome;
  const label = outcome === "miss"
    ? `${sourceName} misses`
    : outcome === "critical"
      ? `Critical ${sourceName}`
      : `${sourceName} hits`;
  return appendFightPresentationEvent(state, {
    type,
    delivery,
    side: target,
    sourceSide: attacker,
    sourceName,
    label,
    amount: damage || undefined
  });
};
