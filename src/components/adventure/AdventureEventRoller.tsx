import type { AdventureCard } from "../../types/adventurePack";
import { AdventureCardTile } from "./AdventureCardTile";

type Props = {
  event?: AdventureCard;
  revealed: boolean;
  onReveal(): void;
  onRoll(): void;
};

export const AdventureEventRoller = ({
  event,
  onReveal,
  onRoll,
  revealed
}: Props) => (
  <section className="adventure-event-roller">
    <header>
      <div><span>Room generator</span><h3>Heartbreak Inn events</h3></div>
      <button onClick={onRoll} type="button">Roll d10 event</button>
    </header>
    {event ? (
      <AdventureCardTile card={event} dmView onAction={onReveal} revealed={revealed} />
    ) : (
      <p>Roll digitally, roll a physical d10 and choose the result, or leave the inn quiet.</p>
    )}
  </section>
);
