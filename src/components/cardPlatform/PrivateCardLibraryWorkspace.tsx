import { useEffect, useRef, useState } from "react";
import type { GameSystemId } from "../../types/cardPlatform";
import { usePrivateCardLibrary } from "../../hooks/usePrivateCardLibrary";
import { PrivateCardLibraryBrowser } from "./PrivateCardLibraryBrowser";
import { PrivateLibraryImportPreview } from "./PrivateLibraryImportPreview";

const systemLabel = (gameSystemId: GameSystemId): string => gameSystemId === "dnd-2014"
  ? "D&D 2014"
  : gameSystemId === "dnd-2024"
    ? "D&D 2024"
    : "Call of Cthulhu 7e";

export const PrivateCardLibraryWorkspace = ({
  gameSystemId
}: {
  gameSystemId: GameSystemId;
}) => {
  const library = usePrivateCardLibrary(gameSystemId);
  const fileInput = useRef<HTMLInputElement>(null);
  const [replacementConfirmed, setReplacementConfirmed] = useState(false);

  useEffect(() => setReplacementConfirmed(false), [gameSystemId, library.preview]);

  const chooseFile = async (file?: File) => {
    if (!file) return;
    await library.previewFile(file);
    if (fileInput.current) fileInput.current.value = "";
  };

  const commit = () => {
    if (library.commitPreview()) setReplacementConfirmed(false);
  };

  const clear = () => {
    if (window.confirm(`Clear only the ${systemLabel(gameSystemId)} private library from this browser?`)) {
      library.clear();
    }
  };

  return (
    <section className="private-library-workspace" aria-labelledby="private-library-title">
      <header className="private-library-workspace__header">
        <div>
          <small>{systemLabel(gameSystemId)} · local-first</small>
          <h1 id="private-library-title">Private Card Library</h1>
          <p>Validate, review, and store one exact-system Card Platform archive in this browser.</p>
        </div>
        <span>{library.library.definitions.length} cards saved</span>
      </header>

      <div className="private-library-workspace__actions">
        <label className="private-library-workspace__file">
          <span>Choose a DM Forge archive</span>
          <input
            accept=".json,application/json"
            onChange={(event) => { void chooseFile(event.target.files?.[0]); }}
            ref={fileInput}
            type="file"
          />
          <small>Maximum 5 MB. Selection validates only; it does not save automatically.</small>
        </label>
        <button disabled={library.isEmpty} onClick={library.exportLibrary} type="button">Export saved library</button>
        <button disabled={library.isEmpty} onClick={clear} type="button">Clear selected library</button>
      </div>

      {(library.status || library.error) && (
        <p className={library.error ? "private-library-workspace__message is-error" : "private-library-workspace__message"} role={library.error ? "alert" : "status"}>
          {library.error ?? library.status}
        </p>
      )}

      {library.preview && (
        <PrivateLibraryImportPreview
          onCancel={library.cancelPreview}
          onCommit={commit}
          onReplacementConfirmed={setReplacementConfirmed}
          preview={library.preview}
          replacementConfirmed={replacementConfirmed}
          replacing={!library.isEmpty}
        />
      )}

      {library.isEmpty ? (
        <div className="private-library-workspace__empty">
          <span aria-hidden="true">🗃️</span>
          <h2>No private cards saved for {systemLabel(gameSystemId)}.</h2>
          <p>Built-in SRD and verified cards remain separate. Importing here never replaces them.</p>
        </div>
      ) : (
        <PrivateCardLibraryBrowser library={library.library} />
      )}
    </section>
  );
};
