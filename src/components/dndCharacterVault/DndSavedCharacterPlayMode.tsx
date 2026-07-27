import { useEffect, useMemo, useState } from "react";
import { DndPregenCharacterSheet } from "../DndPregenCharacterSheet";
import type { DndOptimizedBuildProfile, DndSavedCharacterState } from "../../types/dndCharacterVault";
import { validateDndSavedCharacterState } from "../../utils/dndSavedCharacterState";
import { DndSavedCharacterHealthEditor } from "./DndSavedCharacterHealthEditor";
import { DndSavedCharacterItemEditor } from "./DndSavedCharacterItemEditor";
import { DndSavedCharacterNotesEditor } from "./DndSavedCharacterNotesEditor";
import { DndSavedCharacterResourceEditor } from "./DndSavedCharacterResourceEditor";

const cloneState = (state: DndSavedCharacterState): DndSavedCharacterState => ({
  ...state,
  resourceState: { ...state.resourceState },
  spellSlotState: { ...state.spellSlotState },
  itemChargeState: { ...state.itemChargeState },
  attunedItemIds: [...state.attunedItemIds]
});

export const DndSavedCharacterPlayMode = ({
  profile,
  savedState,
  busy,
  feedback,
  error,
  onClose,
  onSave
}: {
  profile: DndOptimizedBuildProfile;
  savedState: DndSavedCharacterState;
  busy: boolean;
  feedback: string;
  error: string;
  onClose: () => void;
  onSave: (state: DndSavedCharacterState) => Promise<void>;
}) => {
  const [draft, setDraft] = useState(() => cloneState(savedState));

  useEffect(() => setDraft(cloneState(savedState)), [savedState]);

  const issues = useMemo(
    () => validateDndSavedCharacterState(draft, profile),
    [draft, profile]
  );
  const dirty = JSON.stringify(draft) !== JSON.stringify(savedState);
  const saveDraft = async () => {
    if (issues.length > 0) return;
    await onSave({ ...draft, updatedAt: new Date().toISOString() });
  };

  return (
    <section className="saved-character-editor" aria-labelledby="saved-character-editor-title">
      <header className="saved-character-editor__header">
        <div>
          <p>Saved Character Play Mode</p>
          <h2 id="saved-character-editor-title">{draft.displayName}</h2>
          <span>Level {profile.level} {profile.character.className} · {profile.character.subclassName}</span>
        </div>
        <div>
          <button disabled={busy} onClick={onClose} type="button">Close</button>
          <button disabled={busy || !dirty || issues.length > 0} onClick={() => void saveDraft()} type="button">
            Save changes
          </button>
        </div>
      </header>

      <div className="saved-character-editor__controls">
        <DndSavedCharacterHealthEditor
          disabled={busy}
          maximumHitPoints={profile.character.maximumHitPoints}
          onChange={setDraft}
          state={draft}
        />
        <DndSavedCharacterResourceEditor
          disabled={busy}
          onChange={setDraft}
          profile={profile}
          state={draft}
        />
        <DndSavedCharacterItemEditor
          disabled={busy}
          onChange={setDraft}
          profile={profile}
          state={draft}
        />
        <DndSavedCharacterNotesEditor disabled={busy} onChange={setDraft} state={draft} />
      </div>

      {issues.length > 0 && (
        <section className="saved-character-editor__issues" role="alert">
          <h3>Fix before saving</h3>
          <ul>{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
        </section>
      )}
      <div aria-live="polite" className="saved-character-editor__feedback">
        {busy && <span>Saving…</span>}
        {feedback && <span>{feedback}</span>}
        {error && <span role="alert">{error}</span>}
      </div>

      <DndPregenCharacterSheet
        onSave={() => void saveDraft()}
        profile={profile}
        record={profile.character}
        savedState={draft}
        saveLabel="Save changes"
        signedIn
      />
    </section>
  );
};
