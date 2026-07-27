import type { useCardDeckLibrary } from "../../hooks/useCardDeckLibrary";
import { getActiveCardDeckLibraryView } from "../../utils/cardDeckLibraryView";
import { PlayableCardRuntimePanel } from "./PlayableCardRuntimePanel";
import { PlayableDeckManager } from "./PlayableDeckManager";

export type CardDeckLibraryController = ReturnType<typeof useCardDeckLibrary>;

export const PlayableDeckWorkspace = ({ controller }: { controller: CardDeckLibraryController }) => {
  const view = getActiveCardDeckLibraryView(controller.library);
  const definitions = new Map(controller.library.definitions.map((definition) => [definition.id, definition]));
  return (
    <section className="playable-deck-workspace" aria-labelledby="playable-deck-workspace-title">
      <h1 className="sr-only" id="playable-deck-workspace-title">Playable Card Deck Workspace</h1>
      <PlayableDeckManager
        library={controller.library}
        onArchive={controller.archiveDeck}
        onCreate={controller.createDeck}
        onDelete={controller.deleteDeck}
        onDuplicate={controller.duplicateDeck}
        onExport={controller.exportDeck}
        onRefresh={controller.refreshDeck}
        onRename={controller.renameDeck}
        onSelect={controller.setActiveDeck}
      />
      {(controller.error || controller.issues.length > 0) && (
        <div className="playable-deck-workspace__warning" role="alert">
          <strong>Deck library needs attention.</strong>
          {controller.error && <p>{controller.error}</p>}
          {controller.issues.length > 0 && <ul>{controller.issues.slice(0, 20).map((issue, index) => <li key={`${issue.scope}-${issue.id ?? index}`}>{issue.id ? `${issue.id}: ` : ""}{issue.message}</li>)}</ul>}
        </div>
      )}
      {!view ? (
        <p className="playable-deck-workspace__empty">Create or select a playable deck. Catalog cards can then be added as independently tracked copies.</p>
      ) : (
        <section className="playable-deck-table" aria-labelledby="playable-deck-table-title">
          <header>
            <div><small>{view.deck.kind.replaceAll("-", " ")} · {view.deck.gameSystemId}</small><h2 id="playable-deck-table-title">{view.deck.name}</h2></div>
            <span>{view.instances.length} runtime card cop{view.instances.length === 1 ? "y" : "ies"}</span>
          </header>
          {(view.missingDefinitionIds.length > 0 || view.missingInstanceIds.length > 0) && (
            <div className="playable-deck-table__missing" role="alert">
              <strong>Missing references remain visible.</strong>
              {view.missingDefinitionIds.length > 0 && <p>Definitions: {view.missingDefinitionIds.join(", ")}</p>}
              {view.missingInstanceIds.length > 0 && <p>Instances: {view.missingInstanceIds.join(", ")}</p>}
            </div>
          )}
          {view.instances.length === 0 ? <p>This deck is empty. Add cards from the catalog below.</p> : (
            <div className="playable-deck-table__grid">
              {view.instances.map((instance, index) => {
                const definition = definitions.get(instance.definitionId);
                return definition ? (
                  <PlayableCardRuntimePanel
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
                ) : (
                  <article className="playable-deck-table__missing-card" key={instance.id}><strong>Missing definition</strong><p>{instance.definitionId}</p><button onClick={() => controller.removeCard(view.deck.id, instance.id)} type="button">Remove broken copy</button></article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </section>
  );
};
