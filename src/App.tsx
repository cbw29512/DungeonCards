import { DeckGrid } from "./components/DeckGrid";
import "./styles.css";

export const App = () => {
  return (
    <main>
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Dungeon Cards MVP</p>
          <h1>Premium tabletop action cards that roll for you.</h1>
          <p>
            Build a deck for attacks, spells, saves, traps, mimics, and homebrew actions.
            Flip a card and the app returns the randomized result instantly.
          </p>
          <a href="#player-deck-title">Try the deck</a>
        </div>
      </section>

      <DeckGrid />
    </main>
  );
};
