import type { DndAppPage } from "../../integration/dmForgeRoute";
import { dndHomeCards } from "./dndPageRegistry";

export const DndHome = ({
  onNavigate
}: {
  onNavigate(page: DndAppPage): void;
}) => (
  <section className="hero compact-hero">
    <div className="hero__content">
      <p className="hero__eyebrow">DM Forge · Rules Compendium &amp; Roll Cards</p>
      <h1>Choose the card. Run the encounter. Keep playing.</h1>
      <p>
        Verified D&amp;D 2014 and 2024 references, executable cards, exact-edition tables,
        encounter folios, Character Vault, and homebrew tools—local-first with optional accounts.
      </p>
      <div className="role-card-grid">
        {dndHomeCards.map((card) => (
          <button className="role-card" key={card.page} onClick={() => onNavigate(card.page)} type="button">
            <span aria-hidden="true">{card.icon}</span>
            <strong>{card.title}</strong>
            <small>{card.description}</small>
          </button>
        ))}
      </div>
    </div>
  </section>
);
