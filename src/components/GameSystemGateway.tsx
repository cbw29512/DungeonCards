export type GameSystemId = "dnd-5e" | "coc-7e";

type GameSystemGatewayProps = {
  onSelect: (system: GameSystemId) => void;
};

export const GameSystemGateway = ({ onSelect }: GameSystemGatewayProps) => (
  <main className="system-gateway">
    <div className="system-gateway__mist" aria-hidden="true" />
    <section className="system-gateway__panel" aria-labelledby="system-gateway-title">
      <p className="system-gateway__eyebrow">Dungeon Cards · Multi-System Tabletop Toolkit</p>
      <h1 id="system-gateway-title">Which darkness are you entering tonight?</h1>
      <p>
        Choose a rules engine. Each system keeps its cards, workspaces, roll history,
        creatures, and homebrew content isolated.
      </p>

      <div className="system-gateway__choices">
        <button className="system-choice system-choice--dnd" type="button" onClick={() => onSelect("dnd-5e")}>
          <span className="system-choice__sigil" aria-hidden="true">⚔️</span>
          <span>
            <small>Fantasy adventure</small>
            <strong>Dungeons &amp; Dragons 5e</strong>
            <em>Rules cards, attacks, spells, monsters, encounters, and builders.</em>
          </span>
        </button>

        <button className="system-choice system-choice--coc" type="button" onClick={() => onSelect("coc-7e")}>
          <span className="system-choice__sigil" aria-hidden="true">◉</span>
          <span>
            <small>Unofficial private-development preview</small>
            <strong>Call of Cthulhu 7th Edition</strong>
            <em>Percentile investigations, weapons, occult procedures, and Keeper dossiers.</em>
          </span>
        </button>
      </div>

      <p className="system-gateway__notice">
        The Call of Cthulhu preview uses original demonstration content and no official logos,
        artwork, scenarios, spells, tables, or creature statistics.
      </p>
    </section>
  </main>
);
