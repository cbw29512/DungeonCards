import { useMemo, useState } from "react";
import { useCardDeckLibrary } from "../hooks/useCardDeckLibrary";
import type { DndGameSystemId } from "../types/cardPlatform";
import type { HomebrewDiceCard } from "../types/cards";
import type { MonsterCardData } from "../types/monsters";
import { getActiveCardDeckLibraryView } from "../utils/cardDeckLibraryView";
import { buildDndCardCatalog } from "../utils/dndCardCatalogSources";
import { loadCatalogPrivateLibrary } from "../utils/cardCatalogPrivateLibrary";
import { CardCatalogWorkspace } from "./cardPlatform/CardCatalogWorkspace";
import { PlayableDeckWorkspace } from "./cardPlatform/PlayableDeckWorkspace";

export const DndCardCatalog = ({
  homebrewCards,
  homebrewMonsters
}: {
  homebrewCards: HomebrewDiceCard[];
  homebrewMonsters: MonsterCardData[];
}) => {
  const [gameSystemId, setGameSystemId] = useState<DndGameSystemId>("dnd-2024");
  const loaded = useMemo(() => loadCatalogPrivateLibrary(gameSystemId), [gameSystemId]);
  const decks = useCardDeckLibrary(gameSystemId);
  const activeDeck = getActiveCardDeckLibraryView(decks.library)?.deck;
  const catalog = useMemo(() => {
    const built = buildDndCardCatalog(gameSystemId, homebrewCards, homebrewMonsters, loaded.archive);
    return loaded.issue
      ? { ...built, issues: [{ sourceId: "private" as const, message: loaded.issue }, ...built.issues] }
      : built;
  }, [gameSystemId, homebrewCards, homebrewMonsters, loaded]);
  const actions = [
    { sourceId: "rules" as const, label: "Rules" },
    { sourceId: "conditions" as const, label: "Conditions" },
    { sourceId: "spells" as const, label: "SRD Spells" },
    { sourceId: "monsters" as const, label: "SRD Monsters" },
    { sourceId: "characters" as const, label: "Character Vault" },
    { sourceId: "homebrew" as const, label: "Homebrew" },
    { sourceId: "private" as const, label: "Private Library" }
  ];
  return (
    <div className="dnd-card-catalog">
      <section className="dnd-card-catalog__edition" aria-labelledby="dnd-card-catalog-edition-title">
        <div><small>Exact-edition boundary</small><h1 id="dnd-card-catalog-edition-title">Choose the D&D Card Catalog</h1><p>Rules, conditions, spells, monsters, characters, homebrew, imports, and playable decks stay inside one edition.</p></div>
        <div role="group" aria-label="D&D Card Catalog edition">
          <button aria-pressed={gameSystemId === "dnd-2014"} onClick={() => setGameSystemId("dnd-2014")} type="button">D&D 2014</button>
          <button aria-pressed={gameSystemId === "dnd-2024"} onClick={() => setGameSystemId("dnd-2024")} type="button">D&D 2024</button>
        </div>
      </section>
      <PlayableDeckWorkspace controller={decks} />
      <CardCatalogWorkspace activeDeckName={activeDeck?.name} catalog={catalog} onAddCard={decks.addCard} sourceActions={actions} />
    </div>
  );
};
