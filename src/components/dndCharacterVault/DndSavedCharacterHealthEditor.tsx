import type { DndSavedCharacterState } from "../../types/dndCharacterVault";

const clamp = (value: number, minimum: number, maximum: number): number => (
  Math.min(maximum, Math.max(minimum, Math.trunc(Number.isFinite(value) ? value : minimum)))
);

export const DndSavedCharacterHealthEditor = ({
  state,
  maximumHitPoints,
  disabled,
  onChange
}: {
  state: DndSavedCharacterState;
  maximumHitPoints: number;
  disabled: boolean;
  onChange: (state: DndSavedCharacterState) => void;
}) => {
  const setNumber = (
    field: "currentHitPoints" | "temporaryHitPoints" | "deathSaveSuccesses" | "deathSaveFailures",
    value: number,
    maximum: number
  ) => onChange({ ...state, [field]: clamp(value, 0, maximum) });

  return (
    <section className="saved-character-editor__card" aria-labelledby="saved-health-title">
      <h3 id="saved-health-title">Health &amp; survival</h3>
      <label>
        Character name
        <input
          disabled={disabled}
          maxLength={80}
          onChange={(event) => onChange({ ...state, displayName: event.target.value })}
          value={state.displayName}
        />
      </label>
      <div className="saved-character-editor__field-grid">
        <label>
          Current HP
          <input
            disabled={disabled}
            max={maximumHitPoints}
            min={0}
            onChange={(event) => setNumber("currentHitPoints", Number(event.target.value), maximumHitPoints)}
            type="number"
            value={state.currentHitPoints}
          />
        </label>
        <label>
          Temporary HP
          <input
            disabled={disabled}
            min={0}
            onChange={(event) => setNumber("temporaryHitPoints", Number(event.target.value), 999)}
            type="number"
            value={state.temporaryHitPoints}
          />
        </label>
        <label>
          Death successes
          <input
            disabled={disabled}
            max={3}
            min={0}
            onChange={(event) => setNumber("deathSaveSuccesses", Number(event.target.value), 3)}
            type="number"
            value={state.deathSaveSuccesses}
          />
        </label>
        <label>
          Death failures
          <input
            disabled={disabled}
            max={3}
            min={0}
            onChange={(event) => setNumber("deathSaveFailures", Number(event.target.value), 3)}
            type="number"
            value={state.deathSaveFailures}
          />
        </label>
      </div>
      <label className="saved-character-editor__check">
        <input
          checked={state.inspiration}
          disabled={disabled}
          onChange={(event) => onChange({ ...state, inspiration: event.target.checked })}
          type="checkbox"
        />
        Inspiration available
      </label>
    </section>
  );
};
