import type { MonsterCardData, MonsterItem } from "../types/monsters";
import { listMonsterText, monsterRulesetLabel } from "../utils/monsterCards";
import { MonsterCardFace } from "./MonsterCardFace";

const ItemList = ({ items }: { items: MonsterItem[] }) => items.length > 0 ? (
  <ul className="monster-folio__items">
    {items.map((item, index) => (
      <li key={`${item.name}-${index}`}>
        <strong>{item.name}.</strong>{" "}
        {[item.hit, item.reach, item.damage].filter(Boolean).join(" • ")}
        {item.text && <> — {item.text}</>}
      </li>
    ))}
  </ul>
) : <p>—</p>;

const SpellList = ({ monster }: { monster: MonsterCardData }) => {
  if (!monster.spellcasting) return <p>No spellcasting.</p>;
  return (
    <div className="monster-folio__spells">
      <p><strong>{monster.spellcasting.header}</strong></p>
      {Object.entries(monster.spellcasting.levels).map(([level, spells]) => (
        <p key={level}><b>{level}:</b> {spells.join(", ")}</p>
      ))}
    </div>
  );
};

type MonsterFolioProps = {
  monster: MonsterCardData;
};

export const MonsterFolio = ({ monster }: MonsterFolioProps) => (
  <section className="monster-folio" aria-label={`${monster.name} full monster folio`}>
    <div className="monster-folio__panel monster-folio__cover">
      <MonsterCardFace monster={monster} />
    </div>
    <div className="monster-folio__panel">
      <h3>Defense & Awareness</h3>
      <p><b>Saves:</b> {listMonsterText(monster.saves)}</p>
      <p><b>Skills:</b> {listMonsterText(monster.skills)}</p>
      <p><b>Senses:</b> {monster.senses}</p>
      <p><b>Languages:</b> {monster.languages || "—"}</p>
      <p><b>Resistances:</b> {listMonsterText(monster.resistances)}</p>
      <p><b>Immunities:</b> {listMonsterText(monster.immunities)}</p>
      <p><b>Condition Immunities:</b> {listMonsterText(monster.conditionImmunities)}</p>
    </div>
    <div className="monster-folio__panel">
      <h3>Traits</h3>
      <ItemList items={monster.traits} />
      <h3>Actions</h3>
      <ItemList items={monster.actions} />
    </div>
    <div className="monster-folio__panel">
      <h3>Bonus Actions</h3>
      <ItemList items={monster.bonusActions} />
      <h3>Reactions</h3>
      <ItemList items={monster.reactions} />
    </div>
    <div className="monster-folio__panel">
      <h3>Legendary Actions</h3>
      <ItemList items={monster.legendaryActions} />
      <h3>Lair Actions</h3>
      <ItemList items={monster.lairActions} />
    </div>
    <div className="monster-folio__panel">
      <h3>Spellcasting</h3>
      <SpellList monster={monster} />
      <h3>Source</h3>
      <p>{monsterRulesetLabel(monster)} • {monster.source}</p>
    </div>
  </section>
);