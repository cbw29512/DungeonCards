import { useMemo } from "react";
import { useCardDeckLibrary } from "../hooks/useCardDeckLibrary";
import { getActiveCardDeckLibraryView } from "../utils/cardDeckLibraryView";
import { buildCocCardCatalog } from "../utils/cocCardCatalogSources";
import { loadCatalogPrivateLibrary } from "../utils/cardCatalogPrivateLibrary";
import { CardCatalogWorkspace } from "./cardPlatform/CardCatalogWorkspace";
import { PlayableDeckWorkspace } from "./cardPlatform/PlayableDeckWorkspace";

export const CocCardCatalog = () => {
  const loaded = useMemo(() => loadCatalogPrivateLibrary("coc-7e"), []);
  const decks = useCardDeckLibrary("coc-7e");
  const activeDeck = getActiveCardDeckLibraryView(decks.library)?.deck;
  const catalog = useMemo(() => {
    const built = buildCocCardCatalog(loaded.archive);
    return loaded.issue
      ? { ...built, issues: [{ sourceId: "private" as const, message: loaded.issue }, ...built.issues] }
      : built;
  }, [loaded]);
  const actions = [
    { sourceId: "coc-procedures" as const, label: "Verified Procedures" },
    { sourceId: "coc-investigators" as const, label: "Investigators" },
    { sourceId: "coc-equipment" as const, label: "Equipment" },
    { sourceId: "coc-rituals" as const, label: "Spells & Rituals" },
    { sourceId: "coc-creatures" as const, label: "Creatures & NPCs" },
    { sourceId: "private" as const, label: "Private Library" }
  ];
  return (
    <div className="coc-card-catalog-runtime">
      <PlayableDeckWorkspace controller={decks} />
      <CardCatalogWorkspace activeDeckName={activeDeck?.name} catalog={catalog} onAddCard={decks.addCard} sourceActions={actions} />
    </div>
  );
};
