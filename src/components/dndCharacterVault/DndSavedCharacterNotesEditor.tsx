import type { DndSavedCharacterState } from "../../types/dndCharacterVault";

export const DndSavedCharacterNotesEditor = ({
  character,
  onChange
}: {
  character: DndSavedCharacterState;
  onChange(character: DndSavedCharacterState): void;
}) => (
  <fieldset className="saved-character-editor__section saved-character-editor__notes">
    <legend>Play notes</legend>
    <label>
      <span>Custom notes</span>
      <textarea
        maxLength={10000}
        onChange={(event) => onChange({ ...character, customNotes: event.target.value })}
        rows={8}
        value={character.customNotes}
      />
      <small>{character.customNotes.length.toLocaleString("en-US")} / 10,000 characters</small>
    </label>
  </fieldset>
);
