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
  rollFightInitiative(createFightBattle(character, monster));

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
    return <section className="fight-runner fight-runner--unavailable" role="status"><strong>This card is not ready for automated combat yet.</strong><span>{executionIssue}</span></section>;
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
      {recentEvents.length > 0 ? (
        <details className="fight-runner__details">
          <summary>Fight log · verify the rolls</summary>
          <ol className="fight-runner__log">
            {recentEvents.map((event) => <li key={event.id}><span>R{event.round} · {event.attackTotal} to hit</span><strong>{event.summary}</strong><small>{combatantName(battle, event.target)}: {event.targetHitPointsAfter} HP</small></li>)}
          </ol>
        </details>
      ) : null}
      <p className="fight-runner__scope">Only combat actions the rules engine can execute safely are included; unsupported abilities are never invented.</p>
    </section>
  );
};
