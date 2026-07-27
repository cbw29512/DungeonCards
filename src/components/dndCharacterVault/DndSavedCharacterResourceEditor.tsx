import type {
  DndOptimizedBuildProfile,
  DndSavedCharacterState
} from "../../types/dndCharacterVault";

type Props = {
  character: DndSavedCharacterState;
  profile: DndOptimizedBuildProfile;
  onChange(character: DndSavedCharacterState): void;
};

type SlotLevel = keyof DndSavedCharacterState["spellSlotState"];

const bounded = (value: string, maximum: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(maximum, Math.trunc(parsed))) : 0;
};

export const DndSavedCharacterResourceEditor = ({ character, profile, onChange }: Props) => {
  const setResource = (id: string, remaining: number) => onChange({
    ...character,
    resourceState: { ...character.resourceState, [id]: remaining }
  });
  const setSlot = (level: SlotLevel, remaining: number) => onChange({
    ...character,
    spellSlotState: { ...character.spellSlotState, [level]: remaining }
  });
  const spellcasting = profile.character.spellcasting;

  return (
    <fieldset className="saved-character-editor__section">
      <legend>Resources and spell slots</legend>
      {profile.character.resources.length === 0 && spellcasting.kind === "none" && (
        <p className="saved-character-editor__empty">No limited-use resources or spell slots at this level.</p>
      )}
      {profile.character.resources.map((resource) => (
        resource.maximum === "unlimited" ? (
          <div className="saved-character-editor__static" key={resource.id}>
            <strong>{resource.name}</strong><span>Unlimited</span>
          </div>
        ) : (
          <label key={resource.id}>
            <span>{resource.name}</span>
            <input
              max={resource.maximum}
              min={0}
              onChange={(event) => setResource(resource.id, bounded(event.target.value, resource.maximum as number))}
              type="number"
              value={character.resourceState[resource.id] ?? 0}
            />
            <small>Maximum {resource.maximum} · refresh {resource.refresh.replace("-", " ")}</small>
          </label>
        )
      ))}
      {spellcasting.kind !== "none" && Object.entries(spellcasting.slotsByLevel).map(([level, maximum]) => {
        const slotLevel = Number(level) as SlotLevel;
        return (
          <label key={level}>
            <span>Level {level} spell slots</span>
            <input
              max={maximum}
              min={0}
              onChange={(event) => setSlot(slotLevel, bounded(event.target.value, maximum ?? 0))}
              type="number"
              value={character.spellSlotState[slotLevel] ?? 0}
            />
            <small>Maximum {maximum}</small>
          </label>
        );
      })}
    </fieldset>
  );
};
