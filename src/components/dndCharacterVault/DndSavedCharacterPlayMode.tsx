import { useEffect, useMemo, useState } from "react";
import { DndPregenCharacterSheet } from "../DndPregenCharacterSheet";
import type {
  DndOptimizedBuildProfile,
  DndSavedCharacterState
} from "../../types/dndCharacterVault";
import { validateDndSavedCharacterState } from "../../utils/dndSavedCharacterState";
import { DndSavedCharacterHealthEditor } from "./DndSavedCharacterHealthEditor";
import { DndSavedCharacterItemEditor } from "./DndSavedCharacterItemEditor";
import { DndSavedCharacterNotesEditor } from "./DndSavedCharacterNotesEditor";
import { DndSavedCharacterResourceEditor } from "./DndSavedCharacterResourceEditor";

type Props = {
  character: DndSavedCharacterState;
  profile: DndOptimizedBuildProfile;
  busy: boolean;
  onSave(character: DndSavedCharacterState): Promise<boolean>;
  onDuplicate(character: DndSavedCharacterState): Promise<boolean>;
  onClose(): void;
};

export const DndSavedCharacterPlayMode = ({
  character,
  profile,
  busy,
  onSave,
  onDuplicate,
  onClose
}: Props) => {
  const [draft, setDraft] = useState(character);
  useEffect(() => setDraft(character), [character]);
  const issues = useMemo(() => validateDndSavedCharacterState(draft, profile), [draft, profile]);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(character), [character, draft]);

  const save = async () => {
    if (issues.length === 0) await onSave(draft);
  };

  return (
    <section className="saved-character-play" aria-labelledby="saved-character-play-title">
      <header className="saved-character-play__header">
        <div>
          <p>Character Vault · Play Mode</p>
          <h2 id="saved-character-play-title">{draft.displayName}</h2>
          <small>{dirty ? "Unsaved changes" : `Saved ${new Date(character.updatedAt).toLocaleString()}`}</small>
        </div>
        <div className="saved-character-play__actions">
          <button disabled={busy} onClick={onClose} type="button">Close</button>
          <button disabled={busy || issues.length > 0} onClick={() => void onDuplicate(draft)} type="button">Duplicate</button>
          <button disabled={busy || !dirty || issues.length > 0} onClick={() => void save()} type="button">Save changes</button>
        </div>
      </header>

      {issues.length > 0 && (
        <div className="saved-character-play__errors" role="alert">
          <strong>Fix these fields before saving:</strong>
          <ul>{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
        </div>
      )}

      <div className="saved-character-editor">
        <DndSavedCharacterHealthEditor
          character={draft}
          maximumHitPoints={profile.character.maximumHitPoints}
          onChange={setDraft}
        />
        <DndSavedCharacterResourceEditor character={draft} onChange={setDraft} profile={profile} />
        <DndSavedCharacterItemEditor character={draft} onChange={setDraft} profile={profile} />
        <DndSavedCharacterNotesEditor character={draft} onChange={setDraft} />
      </div>

      <DndPregenCharacterSheet
        onSave={() => { void save(); }}
        profile={profile}
        record={profile.character}
        savedState={draft}
        saveLabel="Save changes"
        signedIn
      />
    </section>
  );
};
