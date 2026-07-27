import { useMemo, useState } from "react";
import type {
  HomebrewCardDraft,
  HomebrewDiceCard
} from "../types/cards";
import type { RulesetId } from "../types/ruleCards";
import { gameSystemIdForRuleset } from "../utils/cardPlatformGameSystem";
import { DeckGrid } from "./DeckGrid";
import { HomebrewBuilder } from "./HomebrewBuilder";

type Props = {
  cards: HomebrewDiceCard[];
  storageError: string | null;
  migrationNotice: string | null;
  onCreate(draft: HomebrewCardDraft): boolean;
  onDelete(cardId: string): boolean;
};

const editionLabel = (ruleset: RulesetId): string => (
  ruleset === "srd-5.1-2014" ? "2014" : "2024"
);

export const DndHomebrewWorkspace = ({
  cards,
  storageError,
  migrationNotice,
  onCreate,
  onDelete
}: Props) => {
  const [ruleset, setRuleset] = useState<RulesetId>("srd-5.2.1-2024");
  const gameSystemId = gameSystemIdForRuleset(ruleset);
  const visibleCards = useMemo(
    () => cards.filter((card) => card.gameSystemId === gameSystemId),
    [cards, gameSystemId]
  );

  return (
    <>
      {migrationNotice && (
        <p className="workspace-notice" role="status">{migrationNotice}</p>
      )}
      <HomebrewBuilder
        onCreate={onCreate}
        onRulesetChange={setRuleset}
        ruleset={ruleset}
        storageError={storageError}
      />
      {visibleCards.length > 0 ? (
        <DeckGrid
          cards={visibleCards}
          description={`These private cards belong only to the D&D ${editionLabel(ruleset)} library and retain the universal card size.`}
          eyebrow={`D&D ${editionLabel(ruleset)} Homebrew Deck`}
          onDeleteCard={onDelete}
          title="Your custom cards are ready to roll."
        />
      ) : (
        <p className="homebrew-empty">
          No D&amp;D {editionLabel(ruleset)} homebrew cards yet. Build the first card for this edition above.
        </p>
      )}
    </>
  );
};
