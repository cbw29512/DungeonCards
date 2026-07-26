import type { DndCharacterRecord } from "../../types/dndCharacter";
import {
  dndSpellAttackBonus,
  dndSpellSaveDc
} from "../../utils/dndCharacterRecord";

const signed = (value: number): string => `${value >= 0 ? "+" : ""}${value}`;

export const DndVaultSpells = ({ record }: { record: DndCharacterRecord }) => {
  if (record.spellcasting.kind === "none") {
    return (
      <section className="character-vault__card character-vault__empty-panel">
        <h4>No spellcasting profile</h4>
        <p>This build does not cast spells through its class or subclass at this level.</p>
      </section>
    );
  }

  const abilityScore = record.abilityScores[record.spellcasting.ability];
  const attackBonus = dndSpellAttackBonus(abilityScore, record.level);
  const saveDc = dndSpellSaveDc(abilityScore, record.level);

  return (
    <div className="character-vault__panel-grid">
      <section className="character-vault__card character-vault__spell-summary">
        <h4>Spellcasting</h4>
        <div>
          <article><span>Ability</span><strong>{record.spellcasting.ability.toUpperCase()}</strong></article>
          <article><span>Spell Attack</span><strong>{signed(attackBonus)}</strong></article>
          <article><span>Save DC</span><strong>{saveDc}</strong></article>
        </div>
        {record.spellcasting.notes && <p>{record.spellcasting.notes}</p>}
      </section>

      <section className="character-vault__card">
        <h4>Spell slots</h4>
        <div className="character-vault__slot-grid">
          {Object.entries(record.spellcasting.slotsByLevel).map(([level, slots]) => (
            <article key={level}><span>Level {level}</span><strong>{Array.from({ length: slots ?? 0 }, () => "○").join(" ")}</strong></article>
          ))}
        </div>
      </section>

      <section className="character-vault__card">
        <h4>Cantrips</h4>
        <ul>{record.spellcasting.cantrips.map((spell) => <li key={spell}>{spell}</li>)}</ul>
      </section>

      <section className="character-vault__card">
        <h4>{record.spellcasting.kind === "prepared" ? "Prepared spells" : "Known spells"}</h4>
        <ul className="character-vault__spell-list">
          {record.spellcasting.spells.map((spell) => <li key={spell}>{spell}</li>)}
        </ul>
      </section>
    </div>
  );
};
