import type { DndCharacterRecord } from "../../types/dndCharacter";
import type { DndSavedCharacterState } from "../../types/dndCharacterVault";
import {
  dndSpellAttackBonus,
  dndSpellSaveDc
} from "../../utils/dndCharacterRecord";

const signed = (value: number): string => `${value >= 0 ? "+" : ""}${value}`;
type SpellLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const DndVaultSpells = ({
  record,
  savedState
}: {
  record: DndCharacterRecord;
  savedState?: DndSavedCharacterState;
}) => {
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
          {Object.entries(record.spellcasting.slotsByLevel).map(([level, slots]) => {
            const spellLevel = Number(level) as SpellLevel;
            const remaining = savedState?.spellSlotState[spellLevel] ?? slots ?? 0;
            return (
              <article key={level}>
                <span>Level {level}</span>
                <strong>{remaining} / {slots ?? 0}</strong>
              </article>
            );
          })}
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
