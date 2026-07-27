import { useEffect } from "react";
import type { CardDeckLibraryController } from "../../hooks/useCardDeckLibrary";
import { getActiveCardDeckLibraryView } from "../../utils/cardDeckLibraryView";
import { printCardSurface } from "../../utils/printCardSurface";
import { CardActionHistoryPanel } from "./CardActionHistoryPanel";
import { PlayableCardActions } from "./PlayableCardActions";
import { PlayableCardRuntimePanel } from "./PlayableCardRuntimePanel";
import { PlayableDeckManager } from "./PlayableDeckManager";

export const PlayableDeckWorkspace = ({ controller }: { controller: CardDeckLibraryController }) => {
  const view = getActiveCardDeckLibraryView(controller.library);
  const definitions = new Map(controller.library.definitions.map((definition) => [definition.id, definition]));
  const activeInstanceId = view?.state.activeCardInstanceId;
  useEffect(() => {
    if (!activeInstanceId || typeof document === "undefined") return;
    const target = document.getElementById(`playable-card-${activeInstanceId}`);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeInstanceId]);
  return (
    <section className="playable-deck-workspace" aria-labelledby="playable-deck-workspace-title">
      <h1 className="sr-only" id="playable-deck-workspace-title">Playable Card Deck Workspace</h1>
      <PlayableDeckManager library={controller.library} onArchive={controller.archiveDeck} onCreate={controller.createDeck} onDelete={controller.deleteDeck} onDuplicate={controller.duplicateDeck} onExport={controller.exportDeck} onRefresh={controller.refreshDeck} onRename={controller.renameDeck} onSelect={controller.setActiveDeck} />
      {(controller.error || controller.actionError || controller.issues.length > 0) && (
        <div className="playable-deck-workspace__warning" role="alert">
          <strong>Deck library needs attention.</strong>
          {controller.error && <p>{controller.error}</p>}
          {controller.actionError && <p>{controller.actionError}</p>}
          {controller.issues.length > 0 && <ul>{controller.issues.slice(0, 20).map((issue, index) => <li key={`${issue.scope}-${issue.id ?? index}`}>{issue.id ? `${issue.id}: ` : ""}{issue.message}</li>)}</ul>}
        </div>
      )}
      {!view ? <p className="playable-deck-workspace__empty">Create or select a playable deck. Catalog cards can then be added as independently tracked copies.</p> : (
        <section className="playable-deck-table" aria-labelledby="playable-deck-table-title">
          <header><div><small>{view.deck.kind.replaceAll("-", " ")} · {view.deck.gameSystemId}</small><h2 id="playable-deck-table-title">{view.deck.name}</h2></div><div className="playable-deck-table__actions"><span>{view.instances.length} runtime card cop{view.instances.length === 1 ? "y" : "ies"}</span><button disabled={view.instances.length === 0} onClick={() => printCardSurface("playable-deck")} type="button">Print active deck</button></div></header>
          {(view.missingDefinitionIds.length > 0 || view.missingInstanceIds.length > 0) && <div className="playable-deck-table__missing" role="alert"><strong>Missing references remain visible.</strong>{view.missingDefinitionIds.length > 0 && <p>Definitions: {view.missingDefinitionIds.join(", ")}</p>}{view.missingInstanceIds.length > 0 && <p>Instances: {view.missingInstanceIds.join(", ")}</p>}</div>}
          {view.instances.length === 0 ? <p>This deck is empty. Add cards from the catalog below.</p> : (
            <div className="playable-deck-table__grid">{view.instances.map((instance, index) => {
              const definition = definitions.get(instance.definitionId);
              return definition ? (
                <PlayableCardRuntimePanel
                  actionControls={<PlayableCardActions controller={controller} deckId={view.deck.id} definition={definition} instance={instance} />}
                  active={activeInstanceId === instance.id}
                  definition={definition}
                  instance={instance}
                  key={instance.id}
                  onAdjustResource={(resourceId, delta) => controller.adjustResource(instance.id, resourceId, delta)}
                  onMove={(direction) => controller.moveCard(view.deck.id, instance.id, direction)}
                  onRemove={() => controller.removeCard(view.deck.id, instance.id)}
                  onResetCard={() => controller.resetCard(instance.id)}
                  onResetResource={(resourceId) => controller.resetResource(instance.id, resourceId)}
                  onUpdateText={(updates) => controller.updateCardText(instance.id, updates)}
                  position={index}
                  total={view.instances.length}
                />
              ) : <article className="playable-deck-table__missing-card" key={instance.id}><strong>Missing definition</strong><p>{instance.definitionId}</p><button onClick={() => controller.removeCard(view.deck.id, instance.id)} type="button">Remove broken copy</button></article>;
            })}</div>
          )}
        </section>
      )}
      <CardActionHistoryPanel error={controller.historyError} history={controller.history} library={controller.library} onClear={controller.clearHistory} />
    </section>
  );
};
