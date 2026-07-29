import type { AdventureCard, AdventureRuntimeState } from "../../types/adventurePack";
import { AdventureCardTile } from "./AdventureCardTile";

type Props = {
  cards: AdventureCard[];
  state: AdventureRuntimeState;
  onClaim(cardId: string): void;
};

export const AdventurePlayerView = ({ cards, onClaim, state }: Props) => {
  const characters = cards.filter((card) => card.kind === "character");
  const claimed = cards.find((card) => card.id === state.claimedCharacterId);
  const visible = cards.filter((card) => state.revealedCardIds.includes(card.id));
  const backpack = cards.filter((card) => state.backpackCardIds.includes(card.id));

  return (
    <div className="adventure-player">
      <section>
        <h2>Character card</h2>
        {claimed ? (
          <AdventureCardTile card={claimed} dmView={false} />
        ) : (
          <div className="adventure-claim-grid">
            {characters.map((card) => (
              <AdventureCardTile
                actionLabel="Claim character"
                card={card}
                dmView={false}
                key={card.id}
                onAction={() => onClaim(card.id)}
              />
            ))}
          </div>
        )}
      </section>
      <section>
        <h2>Current room and revealed cards</h2>
        <div className="adventure-card-row">
          {visible.length
            ? visible.map((card) => <AdventureCardTile card={card} dmView={false} key={card.id} />)
            : <p className="adventure-empty">The DM has not revealed a card yet.</p>}
        </div>
      </section>
      <section>
        <h2>Backpack</h2>
        <div className="adventure-card-row">
          {backpack.length
            ? backpack.map((card) => <AdventureCardTile card={card} dmView={false} key={card.id} />)
            : <p className="adventure-empty">Approved treasure appears here.</p>}
        </div>
      </section>
    </div>
  );
};
