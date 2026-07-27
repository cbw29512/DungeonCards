import type { DndSavedCharacterState } from "../../types/dndCharacterVault";

type Props = {
  character: DndSavedCharacterState;
  maximumHitPoints: number;
  onChange(character: DndSavedCharacterState): void;
};

const integer = (value: string, minimum: number, maximum?: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return minimum;
  const bounded = Math.max(minimum, Math.trunc(parsed));
  return maximum === undefined ? bounded : Math.min(maximum, bounded);
};

export const DndSavedCharacterHealthEditor = ({ character, maximumHitPoints, onChange }: Props) => {
  const update = (patch: Partial<DndSavedCharacterState>) => onChange({ ...character, ...patch });

  return (
    <fieldset className="saved-character-editor__section">
      <legend>Identity and health</legend>
      <label className="saved-character-editor__wide">
        <span>Character name</span>
        <input
          maxLength={80}
          onChange={(event) => update({ displayName: event.target.value })}
          required
          type="text"
          value={character.displayName}
        />
      </label>
      <label>
        <span>Current HP</span>
        <input
          max={maximumHitPoints}
          min={0}
          onChange={(event) => update({ currentHitPoints: integer(event.target.value, 0, maximumHitPoints) })}
          type="number"
          value={character.currentHitPoints}
        />
        <small>Maximum {maximumHitPoints}</small>
      </label>
      <label>
        <span>Temporary HP</span>
        <input
          min={0}
          onChange={(event) => update({ temporaryHitPoints: integer(event.target.value, 0) })}
          type="number"
          value={character.temporaryHitPoints}
        />
      </label>
      <label className="saved-character-editor__check">
        <input
          checked={character.inspiration}
          onChange={(event) => update({ inspiration: event.target.checked })}
          type="checkbox"
        />
        <span>Inspiration</span>
      </label>
      <label>
        <span>Death Save successes</span>
        <input
          max={3}
          min={0}
          onChange={(event) => update({ deathSaveSuccesses: integer(event.target.value, 0, 3) })}
          type="number"
          value={character.deathSaveSuccesses}
        />
      </label>
      <label>
        <span>Death Save failures</span>
        <input
          max={3}
          min={0}
          onChange={(event) => update({ deathSaveFailures: integer(event.target.value, 0, 3) })}
          type="number"
          value={character.deathSaveFailures}
        />
      </label>
    </fieldset>
  );
};
