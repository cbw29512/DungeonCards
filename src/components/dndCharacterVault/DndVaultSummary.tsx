import type { DndAbilityId, DndCharacterRecord } from "../../types/dndCharacter";
import type { DndSavedCharacterState } from "../../types/dndCharacterVault";
import {
  dndAbilityModifier,
  dndProficiencyBonus
} from "../../utils/dndCharacterRecord";

const abilityLabels: Record<DndAbilityId, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA"
};

const signed = (value: number): string => `${value >= 0 ? "+" : ""}${value}`;

export const DndVaultSummary = ({
  record,
  savedState
}: {
  record: DndCharacterRecord;
  savedState?: DndSavedCharacterState;
}) => {
  const initiative = dndAbilityModifier(record.abilityScores.dex);
  const proficiency = dndProficiencyBonus(record.level);

  return (
    <>
      <section className="character-vault__vitals" aria-label="Core character statistics">
        <article><span>Armor Class</span><strong>{record.armorClass}</strong></article>
        <article>
          <span>Hit Points</span>
          <strong>{savedState ? `${savedState.currentHitPoints}/${record.maximumHitPoints}` : record.maximumHitPoints}</strong>
          {savedState && <small>Temp {savedState.temporaryHitPoints}</small>}
        </article>
        <article><span>Initiative</span><strong>{signed(initiative)}</strong></article>
        <article><span>Speed</span><strong>{record.speedFeet} ft.</strong></article>
        <article><span>Proficiency</span><strong>{signed(proficiency)}</strong></article>
        <article><span>Hit Dice</span><strong>{record.level}d{record.hitDie}</strong></article>
        {savedState && <article><span>Inspiration</span><strong>{savedState.inspiration ? "Yes" : "No"}</strong></article>}
      </section>

      <section className="character-vault__abilities" aria-label="Ability scores">
        {Object.entries(record.abilityScores).map(([ability, score]) => (
          <article key={ability}>
            <span>{abilityLabels[ability as DndAbilityId]}</span>
            <strong>{signed(dndAbilityModifier(score))}</strong>
            <small>{score}</small>
          </article>
        ))}
      </section>
    </>
  );
};
