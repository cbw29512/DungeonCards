import type { FightBattleState, FightSide } from "../types/fightBattle";
import type { FightPixelIdentity } from "../types/fightBattlePresentation";
import {
  characterPixelIdentity,
  deriveFightPixelScene,
  monsterPixelIdentity
} from "../utils/fightBattlePresentation";
import { fightEffectGlyph, fightEffectLabel } from "../utils/fightStatusPresentation";

type Props = {
  battle: FightBattleState;
  characterIdentity?: FightPixelIdentity;
  monsterIdentity?: FightPixelIdentity;
};

const sideClass = (side: FightSide): string => `fight-pixel-arena__combatant--${side}`;

export const DndFightPixelArena = ({ battle, characterIdentity, monsterIdentity }: Props) => {
  const scene = deriveFightPixelScene({
    state: battle,
    characterIdentity: characterIdentity ?? characterPixelIdentity("Adventurer"),
    monsterIdentity: monsterIdentity ?? monsterPixelIdentity(battle.monster.profile.name, "monster")
  });
  const { frame } = scene;

  const combatant = (side: FightSide, identity: FightPixelIdentity) => {
    const state = battle[side];
    const cue = side === "character" ? frame.characterCue : frame.monsterCue;
    const isActive = frame.activeSide === side;
    const takesDamage = frame.damageTarget === side && frame.damageNumber;
    const hpPercent = Math.max(0, Math.min(100, (state.currentHitPoints / state.profile.hitPoints) * 100));
    return (
      <article
        className={`fight-pixel-arena__combatant fight-status-card ${sideClass(side)} fight-pixel-arena__combatant--${cue}${isActive ? " is-active" : ""}`}
        data-archetype={identity.archetype}
        data-cue={cue}
        data-sprite-key={identity.spriteKey}
      >
        <header className="fight-status-card__header">
          <strong>{state.profile.name}</strong>
          <span>AC {state.profile.armorClass}</span>
        </header>
        <div className="fight-status-card__health" aria-label={`${state.currentHitPoints} of ${state.profile.hitPoints} hit points`}>
          <i style={{ width: `${hpPercent}%` }} />
          <span>{state.currentHitPoints}/{state.profile.hitPoints} HP</span>
        </div>
        <div className="fight-pixel-arena__sprite fight-status-card__stage" aria-label={`${state.profile.name}: ${cue}`}>
          <div className="fight-stick" aria-hidden="true">
            <i className="fight-stick__head" />
            <i className="fight-stick__body" />
            <i className="fight-stick__arm fight-stick__arm--front" />
            <i className="fight-stick__arm fight-stick__arm--back" />
            <i className="fight-stick__leg fight-stick__leg--front" />
            <i className="fight-stick__leg fight-stick__leg--back" />
            <b className="fight-stick__identity">{identity.fallbackGlyph}</b>
          </div>
          <i className="fight-pixel-arena__shadow" aria-hidden="true" />
        </div>
        {takesDamage ? <b className="fight-pixel-arena__damage">-{frame.damageNumber}</b> : null}
        <div className="fight-status-card__effects" aria-label={`${state.profile.name} active effects`}>
          {state.effects.length === 0 ? <span className="fight-status-card__clear">NO STATUS</span> : state.effects.map((effect) => (
            <span
              className={`fight-status-chip fight-status-chip--${effect.kind}`}
              key={effect.id}
              title={fightEffectLabel(effect)}
            >
              <b aria-hidden="true">{fightEffectGlyph(effect)}</b>
              <small>{effect.name}</small>
            </span>
          ))}
        </div>
      </article>
    );
  };

  return (
    <section className="fight-pixel-arena fight-card-arena" aria-label="8-bit Fight Cards battle arena">
      <div className="fight-pixel-arena__sky" aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className="fight-pixel-arena__headline" role="status">{frame.headline}</div>
      <div className="fight-pixel-arena__stage fight-card-arena__cards">
        {combatant("character", scene.character)}
        <div className="fight-pixel-arena__versus" aria-hidden="true">VS</div>
        {combatant("monster", scene.monster)}
      </div>
      <footer className="fight-pixel-arena__hud">
        <span>ROUND {frame.round}</span>
        <span>{frame.latestEvent?.sourceActionName ?? "READY"}</span>
        <span>{frame.latestEvent ? `ROLL ${frame.latestEvent.naturalRoll} · ${frame.latestEvent.attackTotal} TO HIT` : "D&D RULES ENGINE"}</span>
      </footer>
    </section>
  );
};
