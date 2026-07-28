import type { DndAppPage } from "../../integration/dmForgeRoute";

export const DndHome = ({ onNavigate }: { onNavigate(page: DndAppPage): void }) => (
  <section className="hero compact-hero home-role-hero">
    <div className="hero__content">
      <p className="hero__eyebrow">DM Forge · Rules Compendium &amp; Roll Cards</p>
      <h1>Choose your side of the table and start playing.</h1>
      <p>
        Verified D&amp;D 2014 and 2024 references, executable cards, exact-edition tables,
        encounter folios, Character Vault, and homebrew tools—local-first with optional accounts.
      </p>
      <div className="home-role-actions" aria-label="Choose a Dungeons & Dragons workspace">
        <button type="button" onClick={() => onNavigate("player")}>
          <small>Player</small>
          <strong>Open Player workspace</strong>
          <span>Keep attacks, checks, spells, conditions, and personal resources ready for your turn.</span>
        </button>
        <button type="button" onClick={() => onNavigate("dm")}>
          <small>Dungeon Master</small>
          <strong>Open DM workspace</strong>
          <span>Build a focused screen for checks, saves, traps, treasure, generators, and table rulings.</span>
        </button>
      </div>
      <p className="home-navigation-note">
        Need a specialist tool? The navigation bar contains Character Vault, encounters, monsters, the SRD Compendium, builders, and the complete Card Catalog.
      </p>
    </div>
  </section>
);