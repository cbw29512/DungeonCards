import { useEffect, useMemo, useState } from "react";
import { getDndVaultCardBundleByBuildId } from "../../data/dndVaultCardLibrary";
import type { DndOptimizedBuildProfile } from "../../types/dndCharacterVault";
import { buildDndVaultCardArchiveDownload } from "../../utils/dndVaultCardArchive";
import {
  countDndVaultCardCategories,
  DND_VAULT_CARD_FILTERS,
  filterDndVaultCards,
  type DndVaultCardFilter
} from "../../utils/dndVaultCardFilters";
import { downloadTextFile } from "../../utils/downloadTextFile";
import { CardPlatformDefinitionCard } from "../cardPlatform/CardPlatformDefinitionCard";

export const DndVaultCardDeck = ({ profile }: { profile: DndOptimizedBuildProfile }) => {
  const bundle = useMemo(() => getDndVaultCardBundleByBuildId(profile.id), [profile.id]);
  const [filter, setFilter] = useState<DndVaultCardFilter>("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const cards = bundle?.definitions ?? [];
  const counts = useMemo(() => countDndVaultCardCategories(cards), [cards]);
  const visibleCards = useMemo(
    () => filterDndVaultCards(cards, filter, query),
    [cards, filter, query]
  );

  useEffect(() => {
    setFilter("all");
    setQuery("");
    setStatus(null);
  }, [profile.id]);

  const exportDeck = () => {
    try {
      const archive = buildDndVaultCardArchiveDownload(profile.id);
      downloadTextFile(archive.filename, archive.text);
      setStatus(`Downloaded ${archive.cardCount} exact-edition cards.`);
    } catch (error) {
      console.error("Downloading Character Vault card deck failed", { buildId: profile.id, error });
      setStatus("The card deck could not be downloaded.");
    }
  };

  if (!bundle) {
    return <p className="vault-card-deck__empty">This character does not have a generated card deck.</p>;
  }

  return (
    <section className="vault-card-deck" aria-labelledby="vault-card-deck-title">
      <header className="vault-card-deck__header">
        <div>
          <small>{bundle.gameSystemId === "dnd-2014" ? "D&D 2014" : "D&D 2024"} · Card Platform v2</small>
          <h4 id="vault-card-deck-title">{bundle.deck.name}</h4>
          <p>{cards.length} fixed-size cards generated from immutable build {profile.id}.</p>
        </div>
        <button onClick={exportDeck} type="button">Download card deck</button>
      </header>

      <div className="vault-card-deck__controls">
        <label>
          <span>Search this character deck</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Spell, action, feature, item, source…"
            type="search"
            value={query}
          />
        </label>
        <div className="vault-card-deck__filters" aria-label="Card categories">
          {DND_VAULT_CARD_FILTERS.map((option) => (
            <button
              aria-pressed={filter === option.id}
              key={option.id}
              onClick={() => setFilter(option.id)}
              type="button"
            >
              {option.label} <span>{counts[option.id]}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="vault-card-deck__result" aria-live="polite">
        Showing {visibleCards.length} of {cards.length} cards.{status ? ` ${status}` : ""}
      </p>

      {visibleCards.length === 0 ? (
        <p className="vault-card-deck__empty">No cards match this search and category.</p>
      ) : (
        <div className="card-platform-grid">
          {visibleCards.map((card) => <CardPlatformDefinitionCard card={card} key={card.id} />)}
        </div>
      )}
    </section>
  );
};
