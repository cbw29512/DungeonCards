import { DndFightCardsArena } from "./DndFightCardsArena";

type FightCardsFrontDoorProps = {
  onOpenDndTools: () => void;
  onOpenOtherSystems: () => void;
};

export const FightCardsFrontDoor = ({ onOpenDndTools, onOpenOtherSystems }: FightCardsFrontDoorProps) => (
  <main className="fight-front-door">
    <header className="fight-front-door__bar" aria-label="Fight Cards navigation">
      <a className="fight-front-door__brand" href="#fight-cards">FIGHT CARDS</a>
      <nav className="fight-front-door__nav" aria-label="Advanced tools">
        <button type="button" onClick={onOpenDndTools}>DungeonCards tools</button>
        <button type="button" onClick={onOpenOtherSystems}>Other games</button>
      </nav>
    </header>

    <section className="fight-front-door__intro" aria-labelledby="fight-front-door-title">
      <p className="fight-front-door__eyebrow">D&amp;D fights you can watch</p>
      <h1 id="fight-front-door-title">Pick the cards. Press FIGHT.</h1>
      <p>Choose a hero and a monster. Fight Cards handles the rules and shows you what happens.</p>
    </section>

    <div id="fight-cards" className="fight-front-door__arena">
      <DndFightCardsArena compactHeading />
    </div>

    <footer className="fight-front-door__footer">
      <span>Simple to play. Detailed when you want it.</span>
      <button type="button" onClick={onOpenDndTools}>Open DungeonCards</button>
    </footer>
  </main>
);
