import type { CardCatalogEntry } from "../../types/cardCatalog";
import { CardPlatformDefinitionCard } from "./CardPlatformDefinitionCard";

export const CardCatalogItem = ({
  entry,
  activeDeckName,
  onAddCard
}: {
  entry: CardCatalogEntry;
  activeDeckName?: string;
  onAddCard?(definition: CardCatalogEntry["definition"]): void;
}) => (
  <div className={`card-catalog__item${entry.privateImported ? " is-private-import" : ""}`}>
    <div className="card-catalog__origin">
      <span>{entry.sourceLabel}</span>
      {entry.privateImported && <strong>Private import</strong>}
    </div>
    <CardPlatformDefinitionCard card={entry.definition} />
    {onAddCard && (
      <button
        className="card-catalog__add"
        disabled={!activeDeckName}
        onClick={() => onAddCard(entry.definition)}
        type="button"
      >
        {activeDeckName ? `Add to ${activeDeckName}` : "Create a deck first"}
      </button>
    )}
  </div>
);
