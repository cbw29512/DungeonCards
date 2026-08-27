import type { FightBattleState, FightSide } from "../types/fightBattle";
import type { FightPixelIdentity } from "../types/fightBattlePresentation";
import {
  characterPixelIdentity,
  deriveFightPixelScene,
  monsterPixelIdentity
} from "../utils/fightBattlePresentation";

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
    return (
      <div
        className={`fight-pixel-arena__combatant ${sideClass(side)} fight-pixel-arena__combatant--${cue}${isActive ? " is-active" : ""}`}
        data-archetype={identity.archetype}
        data-cue={cue}
        data-sprite-key={identity.spriteKey}
      >
        <div className="fight-pixel-arena__nameplate">
          <strong>{state.profile.name}</strong>
          <span>{state.currentHitPoints}/{state.profile.hitPoints} HP</span>
        </div>
        <div className="fight-pixel-arena__sprite" aria-label={`${state.profile.name}: ${cue}`}>
          <span className="fight-pixel-arena__glyph" aria-hidden="true">{identity.fallbackGlyph}</span>
          <i className="fight-pixel-arena__shadow" aria-hidden="true" />
        </div>
        {takesDamage ? <b className="fight-pixel-arena__damage">-{frame.damageNumber}</b> : null}
      </div>
    );
  };

  return (
    <section className="fight-pixel-arena" aria-label="8-bit Fight Cards battle arena">
      <div className="fight-pixel-arena__sky" aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className="fight-pixel-arena__headline" role="status">{frame.headline}</div>
      <div className="fight-pixel-arena__stage">
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
