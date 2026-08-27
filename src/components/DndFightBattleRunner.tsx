import { useState } from "react";
import type { FightBattleState, FightSide } from "../types/fightBattle";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import {
  createFightBattle,
  resolveFightInitiativeTie,
  resolveFightTurn,
  rollFightInitiative,
  runFightToCompletion
} from "../utils/fightBattle";
import { getFightBattleProfileIssue } from "../utils/fightBattleValidation";

type Props = {
  character: FightCombatantProfile;
  monster: FightCombatantProfile;
};

const combatantName = (state: FightBattleState, side: FightSide): string => state[side].profile.name;

export const DndFightBattleRunner = ({ character, monster }: Props) => {
  const [battle, setBattle] = useState<FightBattleState>();
  const executionIssue = getFightBattleProfileIssue(character) ?? getFightBattleProfileIssue(monster);

  const startFight = () => setBattle(rollFightInitiative(createFightBattle(character, monster)));
  const chooseInitiative = (side: FightSide) => setBattle((state) => (
    state ? resolveFightInitiativeTie(state, side) : state
  ));
  const resolveTurn = () => setBattle((state) => (
    state?.status === "active" ? resolveFightTurn(state) : state
  ));
  const autoFight = () => setBattle((state) => (
    state?.status === "active" ? runFightToCompletion(state) : state
  ));

  if (executionIssue) {
    return (
      <section className="fight-runner fight-runner--unavailable" role="status">
        <strong>Battle automation unavailable</strong>
        <span>{executionIssue}</span>
      </section>
    );
  }

  if (!battle) {
    return (
      <section className="fight-runner fight-runner--ready">
        <div>
          <strong>{character.name} vs. {monster.name}</strong>
          <span>Executable baseline duel · initiative, attacks, crits, damage, HP, victory</span>
        </div>
        <button className="fight-runner__fight" onClick={startFight} type="button">FIGHT</button>
      </section>
    );
  }

  const order = battle.initiative?.order;
  const activeSide = battle.status === "active" && order ? order[battle.activeIndex] : undefined;
  const recentEvents = battle.events.slice(-12).reverse();

  return (
    <section className={`fight-runner fight-runner--${battle.status}`} aria-live="polite">
      <header className="fight-runner__scoreboard">
        <div>
          <strong>{battle.character.profile.name}</strong>
          <span>{battle.character.currentHitPoints} / {battle.character.profile.hitPoints} HP</span>
          <progress max={battle.character.profile.hitPoints} value={battle.character.currentHitPoints} />
        </div>
        <b>{battle.status === "complete" ? "VICTOR" : `ROUND ${battle.round}`}</b>
        <div>
          <strong>{battle.monster.profile.name}</strong>
          <span>{battle.monster.currentHitPoints} / {battle.monster.profile.hitPoints} HP</span>
          <progress max={battle.monster.profile.hitPoints} value={battle.monster.currentHitPoints} />
        </div>
      </header>

      {battle.initiative && (
        <p className="fight-runner__initiative">
          Initiative: {character.name} {battle.initiative.characterNaturalRoll} → {battle.initiative.characterTotal} · {monster.name} {battle.initiative.monsterNaturalRoll} → {battle.initiative.monsterTotal}
        </p>
      )}

      {battle.status === "initiative-tie" && (
        <div className="fight-runner__tie">
          <strong>Initiative tie — choose who acts first.</strong>
          <button onClick={() => chooseInitiative("character")} type="button">{character.name} first</button>
          <button onClick={() => chooseInitiative("monster")} type="button">{monster.name} first</button>
        </div>
      )}

      {battle.status === "active" && activeSide && (
        <div className="fight-runner__controls">
          <strong>{combatantName(battle, activeSide)} is up.</strong>
          <button onClick={resolveTurn} type="button">Resolve turn</button>
          <button onClick={autoFight} type="button">Auto-resolve fight</button>
        </div>
      )}

      {battle.status === "complete" && battle.winner && (
        <div className="fight-runner__winner">
          <span>WINNER</span>
          <strong>{combatantName(battle, battle.winner)}</strong>
          <button onClick={() => setBattle(undefined)} type="button">Rematch</button>
        </div>
      )}

      {recentEvents.length > 0 && (
        <ol className="fight-runner__log">
          {recentEvents.map((event) => (
            <li key={event.id}>
              <span>R{event.round} · {event.attackTotal} to hit</span>
              <strong>{event.summary}</strong>
              <small>{combatantName(battle, event.target)}: {event.targetHitPointsAfter} HP</small>
            </li>
          ))}
        </ol>
      )}

      <p className="fight-runner__scope">Current runner executes the canonical basic-attack loop only. Unsupported special abilities are not silently simulated.</p>
    </section>
  );
};
