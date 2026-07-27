import type { PrivateLibraryImportPreview as Preview } from "../../types/privateCardLibrary";
import { totalPrivateLibraryConflicts } from "../../utils/privateCardLibraryImport";

const countList = (counts: Record<string, number>): string => Object.entries(counts)
  .map(([label, count]) => `${label.replaceAll("-", " ")}: ${count}`)
  .join(" · ") || "None";

export const PrivateLibraryImportPreview = ({
  preview,
  replacing,
  replacementConfirmed,
  onReplacementConfirmed,
  onCancel,
  onCommit
}: {
  preview: Preview;
  replacing: boolean;
  replacementConfirmed: boolean;
  onReplacementConfirmed(value: boolean): void;
  onCancel(): void;
  onCommit(): void;
}) => {
  const archive = preview.archive;
  const conflicts = totalPrivateLibraryConflicts(preview.conflicts);
  return (
    <section className="private-library-preview" aria-labelledby="private-library-preview-title">
      <header>
        <div>
          <small>Validated archive preview</small>
          <h2 id="private-library-preview-title">{preview.filename}</h2>
          <p>{archive.gameSystemId} · schema {archive.schemaVersion} · exported {new Date(archive.exportedAt).toLocaleString()}</p>
        </div>
        <span>{archive.definitions.length} cards</span>
      </header>

      <div className="private-library-preview__counts">
        <span><small>Definitions</small><strong>{archive.definitions.length}</strong></span>
        <span><small>Instances</small><strong>{archive.instances.length}</strong></span>
        <span><small>Decks</small><strong>{archive.decks.length}</strong></span>
        <span><small>Deck states</small><strong>{archive.deckStates.length}</strong></span>
        <span><small>Private cards</small><strong>{preview.privateDefinitionCount}</strong></span>
        <span><small>Rebound instances</small><strong>{preview.privateInstanceCount}</strong></span>
      </div>

      <dl className="private-library-preview__details">
        <div><dt>Visibility</dt><dd>{countList(preview.visibilityCounts)}</dd></div>
        <div><dt>Review status</dt><dd>{countList(preview.reviewCounts)}</dd></div>
        <div><dt>Decks</dt><dd>{archive.decks.map((deck) => `${deck.name} (${deck.cardDefinitionIds.length})`).join(" · ") || "None"}</dd></div>
        <div><dt>ID conflicts with saved library</dt><dd>{conflicts} total · cards {preview.conflicts.definitions} · instances {preview.conflicts.instances} · decks {preview.conflicts.decks} · states {preview.conflicts.deckStates}</dd></div>
      </dl>

      {replacing && (
        <label className="private-library-preview__confirm">
          <input
            checked={replacementConfirmed}
            onChange={(event) => onReplacementConfirmed(event.target.checked)}
            type="checkbox"
          />
          Replace the entire currently saved exact-system private library with this validated archive.
        </label>
      )}

      <div className="private-library-preview__actions">
        <button onClick={onCancel} type="button">Cancel</button>
        <button disabled={replacing && !replacementConfirmed} onClick={onCommit} type="button">
          {replacing ? "Replace private library" : "Import private library"}
        </button>
      </div>
    </section>
  );
};
