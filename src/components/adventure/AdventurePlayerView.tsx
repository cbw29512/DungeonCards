import type { AdventureCard, AdventureRuntimeState } from "../../types/adventurePack";
import { AdventureCardTile } from "./AdventureCardTile";

type Props = {
  cards: AdventureCard[];
  state: AdventureRuntimeState;
  onClaim(cardId: string): void;
};

const CardZone = ({
  cards,
  empty,
  title
}: {
  cards: AdventureCard[];
  empty: string;
  title: string;
}) => (
  <section className="adventure-combat-zone">
    <h2>{title}</h2>
    <div className="adventure-card-row">
      {cards.length
        ? cards.map((card) => <AdventureCardTile card={card} dmView={false} key={card.id} />)
        : <p className="adventure-empty">{empty}</p>}
    </div>
  </section>
);

export const AdventurePlayerView = ({ cards, onClaim, state }: Props) => {
  const characters = cards.filter((card) => card.kind === "character");
  const claimed = cards.find((card) => card.id === state.claimedCharacterId);
  const visible = cards.filter((card) => state.revealedCardIds.includes(card.id));
  const backpack = cards.filter((card) => state.backpackCardIds.includes(card.id));
  const room = visible.filter((card) => card.kind === "room");
  const threats = visible.filter((card) => card.kind === "monster");
  const hazards = visible.filter((card) => card.kind === "trap");
  const discoveries = visible.filter((card) => ["npc", "clue", "treasure", "event"].includes(card.kind));

  if (!claimed) {
    return (
      <section className="adventure-player-claim">
        <header><p>Player setup</p><h2>Claim an available character</h2></header>
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
      </section>
    );
  }

  return (
    <div className="adventure-player-combat">
      <aside className="adventure-character-rail">
        <p>My character</p>
        <AdventureCardTile card={claimed} dmView={false} />
        <div className="adventure-turn-resources" aria-label="Turn resources">
          <h2>Turn resources</h2>
          <span>Movement</span><span>Action</span><span>Bonus action</span><span>Reaction</span>
        </div>
      </aside>
      <main className="adventure-combat-board">
        <header>
          <p>Player combat screen</p>
          <h1>{room[0]?.title ?? "Waiting for the DM"}</h1>
          <span>Only player-facing cards revealed by the DM appear here.</span>
        </header>
        <CardZone cards={room} empty="The room card has not been revealed." title="Current room" />
        <CardZone cards={threats} empty="No enemies have been revealed." title="Enemies" />
        <CardZone cards={hazards} empty="No traps or hazards have been revealed." title="Hazards" />
        <CardZone cards={discoveries} empty="NPCs, clues, and rewards appear when revealed." title="Discoveries" />
        <CardZone cards={backpack} empty="DM-approved treasure appears here." title="Backpack" />
      </main>
    </div>
  );
};
