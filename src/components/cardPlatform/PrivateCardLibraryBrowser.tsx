import { useEffect, useMemo, useState } from "react";
import type { CardPlatformExportEnvelope } from "../../types/cardPlatformRuntime";
import {
  EMPTY_PRIVATE_LIBRARY_FILTERS,
  filterPrivateLibraryCards,
  privateLibraryFilterOptions,
  type PrivateLibraryCardFilters
} from "../../utils/privateCardLibraryFilters";
import { CardPlatformDefinitionCard } from "./CardPlatformDefinitionCard";

export const PrivateCardLibraryBrowser = ({
  library
}: {
  library: CardPlatformExportEnvelope;
}) => {
  const [filters, setFilters] = useState<PrivateLibraryCardFilters>(EMPTY_PRIVATE_LIBRARY_FILTERS);
  const options = useMemo(() => privateLibraryFilterOptions(library.definitions), [library.definitions]);
  const cards = useMemo(
    () => filterPrivateLibraryCards(library.definitions, filters),
    [filters, library.definitions]
  );
  const definitionIds = useMemo(
    () => new Set(library.definitions.map((card) => card.id)),
    [library.definitions]
  );

  useEffect(() => setFilters(EMPTY_PRIVATE_LIBRARY_FILTERS), [library]);

  const patch = <K extends keyof PrivateLibraryCardFilters>(key: K, value: PrivateLibraryCardFilters[K]) => (
    setFilters((current) => ({ ...current, [key]: value }))
  );

  return (
    <section className="private-library-browser" aria-labelledby="private-library-browser-title">
      <header>
        <div><small>Saved locally</small><h2 id="private-library-browser-title">Private Card Library</h2></div>
        <span>{library.definitions.length} cards · {library.decks.length} decks</span>
      </header>

      <div className="private-library-browser__filters">
        <label>Search<input onChange={(event) => patch("query", event.target.value)} placeholder="Title, tag, action, source…" type="search" value={filters.query} /></label>
        <label>Family<select onChange={(event) => patch("family", event.target.value)} value={filters.family}><option value="all">All families</option>{options.families.map((family) => <option key={family} value={family}>{family.replaceAll("-", " ")}</option>)}</select></label>
        <label>Visibility<select onChange={(event) => patch("visibility", event.target.value as PrivateLibraryCardFilters["visibility"])} value={filters.visibility}><option value="all">All visibility</option><option value="public">Public</option><option value="player-safe">Player safe</option><option value="game-master-only">GM/Keeper only</option><option value="private">Private</option></select></label>
        <label>Review<select onChange={(event) => patch("review", event.target.value)} value={filters.review}><option value="all">All review states</option>{options.reviews.map((review) => <option key={review} value={review}>{review.replaceAll("-", " ")}</option>)}</select></label>
      </div>

      {library.decks.length > 0 && (
        <div className="private-library-browser__decks" aria-label="Imported decks">
          {library.decks.map((deck) => {
            const missing = deck.cardDefinitionIds.filter((id) => !definitionIds.has(id)).length;
            return <article key={deck.id}><small>{deck.kind.replaceAll("-", " ")}</small><strong>{deck.name}</strong><span>{deck.cardDefinitionIds.length} cards · {missing} missing references</span></article>;
          })}
        </div>
      )}

      <p className="private-library-browser__result" aria-live="polite">Showing {cards.length} of {library.definitions.length} cards.</p>
      {cards.length === 0 ? (
        <p className="private-library-browser__empty">No saved cards match these filters.</p>
      ) : (
        <div className="card-platform-grid">
          {cards.map((card) => <CardPlatformDefinitionCard card={card} key={card.id} />)}
        </div>
      )}
    </section>
  );
};
