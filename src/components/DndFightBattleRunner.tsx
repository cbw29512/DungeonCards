import { useEffect, useState } from "react";
import type { FightBattleState, FightSide } from "../types/fightBattle";
import type { FightPixelIdentity } from "../types/fightBattlePresentation";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import {
  createFightBattle,
  resolveFightInitiativeTie,
  resolveFightTurn,
  rollFightInitiative
} from "../utils/fightBattle";
import { getFightBattleProfileIssue } from "../utils/fightBattleValidation";
import {
  FIGHT_WATCHED_STARTING_DISTANCE_FEET,
  setFightStartingDistance
} from "../utils/fightEncounterSetup";
import { DndFightPixelArena } from "./DndFightPixelArena";

type Props = {
  character: FightCombatantProfile;
  monster: FightCombatantProfile;
  characterIdentity?: FightPixelIdentity;
  monsterIdentity?: FightPixelIdentity;
  autoStart?: boolean;
  onChangeFighters?: () => void;
};

const combatantName = (state: FightBattleState, side: FightSide): string => state[side].profile.name;
const startBattle = (character: FightCombatantProfile, monster: FightCombatantProfile): FightBattleState =>
  rollFightInitiative(setFightStartingDistance(
    createFightBattle(character, monster),
    FIGHT_WATCHED_STARTING_DISTANCE_FEET
  ));

export const DndFightBattleRunner = ({ character, monster, characterIdentity, monsterIdentity, autoStart = false, onChangeFighters }: Props) => {
  const [battle, setBattle] = useState<FightBattleState | undefined>(() => autoStart ? startBattle(character, monster) : undefined);
  const executionIssue = getFightBattleProfileIssue(character) ?? getFightBattleProfileIssue(monster);
  const startFight = () => setBattle(startBattle(character, monster));

  useEffect(() => {
    if (!autoStart || !battle || battle.status === "complete" || executionIssue) return undefined;
    const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      setBattle((state) => {
        if (!state || state.status === "complete") return state;
        if (state.status === "initiative-tie") {
          const first: FightSide = state.initiative && state.initiative.characterNaturalRoll >= state.initiative.monsterNaturalRoll ? "character" : "monster";
          return resolveFightInitiativeTie(state, first);
        }
        return state.status === "active" ? resolveFightTurn(state) : state;
      });
    }, reducedMotion ? 160 : 760);
    return () => window.clearTimeout(timer);
  }, [autoStart, battle, executionIssue]);

  if (executionIssue) {
    return (
      <section className="fight-runner fight-runner--unavailable" role="status">
        <strong>This fighter is not ready for the arena yet.</strong>
        {onChangeFighters ? <button onClick={onChangeFighters} type="button">Choose another card</button> : null}
        <details className="fight-runner__details">
          <summary>DM Details</summary>
          <p>{executionIssue}</p>
        </details>
      </section>
    );
  }

  if (!battle) {
    return <section className="fight-runner fight-runner--ready"><div><strong>{character.name} vs. {monster.name}</strong><span>Two cards enter. The rules decide.</span></div><button className="fight-runner__fight" onClick={startFight} type="button">FIGHT</button></section>;
  }

  const recentEvents = battle.events.slice(-16).reverse();

  return (
    <section className={`fight-runner fight-runner--${battle.status}`} aria-live="polite">
      <DndFightPixelArena battle={battle} characterIdentity={characterIdentity} monsterIdentity={monsterIdentity} />
      {battle.status === "initiative-tie" ? <p className="fight-runner__initiative">Initiative tied. The arena breaks the tie automatically.</p> : null}
      {battle.status === "complete" && battle.winner ? (
        <div className="fight-runner__winner">
          <span>WINNER</span>
          <strong>{combatantName(battle, battle.winner)}</strong>
          <div className="fight-runner__winner-actions">
            <button onClick={startFight} type="button">Fight again</button>
            {onChangeFighters ? <button onClick={onChangeFighters} type="button">Change fighters</button> : null}
          </div>
        </div>
      ) : null}
      <details className="fight-runner__details">
        <summary>DM Details · rolls &amp; rules</summary>
        <div className="fight-runner__dm-copy">
          <p><strong>Encounter start:</strong> the watched neutral arena starts the two cards {FIGHT_WATCHED_STARTING_DISTANCE_FEET} ft apart. D&amp;D itself leaves starting positions to the GM/encounter.</p>
          <p><strong>Heroic Crits:</strong> a crit adds the maximum value of the attack&apos;s crit-eligible base dice to one normal damage roll; flat modifiers apply once. This is a Fight Cards house rule.</p>
          <p><strong>Automation:</strong> only combat actions the engine can execute safely are used; unsupported abilities are never invented.</p>
        </div>
        {recentEvents.length > 0 ? (
          <ol className="fight-runner__log">
            {recentEvents.map((event) => <li key={event.id}><span>R{event.round} · {event.attackTotal} to hit</span><strong>{event.summary}</strong><small>{combatantName(battle, event.target)}: {event.targetHitPointsAfter} HP</small></li>)}
          </ol>
        ) : <p>No attack rolls yet.</p>}
      </details>
    </section>
  );
};
