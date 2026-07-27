import { useState } from "react";
import type { CardDeckLibraryEnvelope } from "../../types/cardDeckLibrary";
import type { CardResourceRefresh } from "../../types/cardPlatformActions";
import type { DeckKind } from "../../types/cardPlatformRuntime";

const KINDS: DeckKind[] = ["personal", "game-master", "encounter", "character", "investigator", "campaign", "print", "favorites"];
const REFRESHES: Array<{ id: CardResourceRefresh; label: string }> = [
  { id: "short-rest", label: "Short Rest" },
  { id: "long-rest", label: "Long Rest" },
  { id: "daily", label: "Daily" },
  { id: "session", label: "Session" },
  { id: "manual", label: "Manual" }
];

type Props = {
  library: CardDeckLibraryEnvelope;
  onCreate(name: string, kind: DeckKind): void;
  onSelect(deckId: string): void;
  onRename(deckId: string, name: string): void;
  onDuplicate(deckId: string): void;
  onArchive(deckId: string, archived: boolean): void;
  onDelete(deckId: string): void;
  onRefresh(deckId: string, refresh: CardResourceRefresh): void;
  onExport(deckId: string): void;
};

export const PlayableDeckManager = (props: Props) => {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<DeckKind>("personal");
  const [showArchived, setShowArchived] = useState(false);
  const visible = props.library.decks.filter((deck) => (
    showArchived || !props.library.archivedDeckIds.includes(deck.id)
  ));
  const active = props.library.decks.find((deck) => deck.id === props.library.activeDeckId);
  const create = () => {
    if (!name.trim()) return;
    props.onCreate(name, kind);
    setName("");
  };
  return (
    <section className="playable-deck-manager" aria-labelledby="playable-deck-manager-title">
      <header>
        <div><small>Exact-system runtime</small><h2 id="playable-deck-manager-title">Playable Decks</h2></div>
        <label><input checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} type="checkbox" /> Show archived</label>
      </header>
      <div className="playable-deck-manager__create">
        <label>Deck name<input onChange={(event) => setName(event.target.value)} placeholder="Session, character, encounter…" value={name} /></label>
        <label>Deck kind<select onChange={(event) => setKind(event.target.value as DeckKind)} value={kind}>{KINDS.map((value) => <option key={value} value={value}>{value.replaceAll("-", " ")}</option>)}</select></label>
        <button disabled={!name.trim()} onClick={create} type="button">Create deck</button>
      </div>
      {visible.length === 0 ? <p>No playable decks yet. Create one, then add cards from the catalog.</p> : (
        <div className="playable-deck-manager__list">
          {visible.map((deck) => {
            const archived = props.library.archivedDeckIds.includes(deck.id);
            const count = props.library.deckStates.find((state) => state.deckDefinitionId === deck.id)?.cardInstanceIds.length ?? 0;
            return (
              <article className={deck.id === props.library.activeDeckId ? "is-active" : ""} key={deck.id}>
                <button onClick={() => props.onSelect(deck.id)} type="button"><strong>{deck.name}</strong><span>{deck.kind.replaceAll("-", " ")} · {count} copies</span></button>
                <div>
                  <button onClick={() => {
                    const next = window.prompt("Rename deck", deck.name);
                    if (next?.trim()) props.onRename(deck.id, next);
                  }} type="button">Rename</button>
                  <button onClick={() => props.onDuplicate(deck.id)} type="button">Duplicate</button>
                  <button onClick={() => props.onArchive(deck.id, !archived)} type="button">{archived ? "Restore" : "Archive"}</button>
                  <button onClick={() => props.onExport(deck.id)} type="button">Export</button>
                  <button onClick={() => window.confirm(`Delete ${deck.name}?`) && props.onDelete(deck.id)} type="button">Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {active && (
        <div className="playable-deck-manager__refresh" aria-label="Refresh active deck resources">
          <strong>Refresh {active.name}</strong>
          {REFRESHES.map((refresh) => <button key={refresh.id} onClick={() => props.onRefresh(active.id, refresh.id)} type="button">{refresh.label}</button>)}
        </div>
      )}
    </section>
  );
};
