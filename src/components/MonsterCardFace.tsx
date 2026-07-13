import type { MonsterCardData, MonsterItem } from "../types/monsters";
import {
  abilityModifier,
  listMonsterText,
  monsterRulesetLabel
} from "../utils/monsterCards";

const renderItemLine = (item: MonsterItem) => {
  const attack = [item.hit, item.reach, item.damage].filter(Boolean).join(" • ");
  return (
    <li key={`${item.name}-${attack}`}>
      <strong>{item.name}</strong>
      {attack && <span>{attack}</span>}
      {item.text && <small>{item.text}</small>}
    </li>
  );
};

type MonsterCardFaceProps = {
  monster: MonsterCardData;
};

export const MonsterCardFace = ({ monster }: MonsterCardFaceProps) => (
  <article className={`monster-card monster-card--${monster.type.toLowerCase()}`}>
    <header className="monster-card__header">
      <div>
        <small>{monsterRulesetLabel(monster)} • CR {monster.cr}</small>
        <h3>{monster.name}</h3>
        <span>{monster.size} {monster.type}</span>
      </div>
      <b className="monster-card__cr">CR {monster.cr}</b>
    </header>

    <div className="monster-card__vitals">
      <span>🛡 {monster.ac}</span>
      <span>❤️ {monster.hp}</span>
      <span>👣 {monster.speed}</span>
    </div>

    <div className="monster-card__abilities" aria-label="Ability scores">
      {Object.entries(monster.abilities).map(([ability, score]) => (
        <div key={ability}>
          <b>{ability.toUpperCase()}</b>
          <span>{score}</span>
          <small>{abilityModifier(score)}</small>
        </div>
      ))}
    </div>

    <dl className="monster-card__details">
      <div><dt>Saves</dt><dd>{listMonsterText(monster.saves)}</dd></div>
      <div><dt>Skills</dt><dd>{listMonsterText(monster.skills)}</dd></div>
      <div><dt>Senses</dt><dd>{monster.senses}</dd></div>
      <div><dt>Resist / Immune</dt><dd>{[...monster.resistances, ...monster.immunities].join(", ") || "—"}</dd></div>
    </dl>

    <section className="monster-card__actions">
      <h4>Combat Actions</h4>
      <ul>{monster.actions.slice(0, 4).map(renderItemLine)}</ul>
    </section>

    <footer>{monster.source}</footer>
  </article>
);