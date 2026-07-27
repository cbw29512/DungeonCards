import type { DndOptimizedBuildProfile, DndSavedCharacterState } from "../../types/dndCharacterVault";

type SpellLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const bounded = (value: number, maximum: number): number => (
  Math.min(maximum, Math.max(0, Math.trunc(Number.isFinite(value) ? value : 0)))
);

export const DndSavedCharacterResourceEditor = ({
  profile,
  state,
  disabled,
  onChange
}: {
  profile: DndOptimizedBuildProfile;
  state: DndSavedCharacterState;
  disabled: boolean;
  onChange: (state: DndSavedCharacterState) => void;
}) => {
  const setResource = (resourceId: string, remaining: number, maximum: number) => onChange({
    ...state,
    resourceState: { ...state.resourceState, [resourceId]: bounded(remaining, maximum) }
  });
  const setSpellSlot = (level: SpellLevel, remaining: number, maximum: number) => onChange({
    ...state,
    spellSlotState: { ...state.spellSlotState, [level]: bounded(remaining, maximum) }
  });

  return (
    <section className="saved-character-editor__card" aria-labelledby="saved-resources-title">
      <h3 id="saved-resources-title">Resources &amp; spell slots</h3>
      <div className="saved-character-editor__tracker-list">
        {profile.character.resources.length === 0 && <p>No limited class resources at this level.</p>}
        {profile.character.resources.map((resource) => (
          <label key={resource.id}>
            <span>{resource.name}</span>
            {resource.maximum === "unlimited" ? (
              <strong>Unlimited</strong>
            ) : (
              <input
                disabled={disabled}
                max={resource.maximum}
                min={0}
                onChange={(event) => setResource(resource.id, Number(event.target.value), resource.maximum)}
                type="number"
                value={state.resourceState[resource.id] ?? resource.maximum}
              />
            )}
            <small>{resource.refresh === "none" ? "No refresh" : `Refresh: ${resource.refresh.replace("-", " ")}`}</small>
          </label>
        ))}
      </div>

      {profile.character.spellcasting.kind !== "none" && (
        <>
          <h4>Remaining spell slots</h4>
          <div className="saved-character-editor__field-grid">
            {Object.entries(profile.character.spellcasting.slotsByLevel).map(([level, maximum]) => {
              const spellLevel = Number(level) as SpellLevel;
              const slotMaximum = maximum ?? 0;
              return (
                <label key={level}>
                  Level {level}
                  <input
                    disabled={disabled}
                    max={slotMaximum}
                    min={0}
                    onChange={(event) => setSpellSlot(spellLevel, Number(event.target.value), slotMaximum)}
                    type="number"
                    value={state.spellSlotState[spellLevel] ?? slotMaximum}
                  />
                </label>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
