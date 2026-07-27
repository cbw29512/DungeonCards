import type { DndSavedCharacterState } from "../../types/dndCharacterVault";

export const DndSavedCharacterNotesEditor = ({
  state,
  disabled,
  onChange
}: {
  state: DndSavedCharacterState;
  disabled: boolean;
  onChange: (state: DndSavedCharacterState) => void;
}) => (
  <section className="saved-character-editor__card" aria-labelledby="saved-notes-title">
    <h3 id="saved-notes-title">Session notes</h3>
    <label>
      Player notes
      <textarea
        disabled={disabled}
        maxLength={5000}
        onChange={(event) => onChange({ ...state, customNotes: event.target.value })}
        placeholder="Conditions, treasure, NPC names, reminders, and session notes"
        rows={10}
        value={state.customNotes}
      />
    </label>
  </section>
);
